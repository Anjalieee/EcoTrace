"""
Bulk Consumer Portal Routes — In-Memory (No DB)
Modules: 0-Registry, 1-Device Triage, 2-Collector Matching, 3-EPR Dashboard
DSA Used: Decision Tree (triage), Greedy + KD-Tree (collector match), BST (EPR range query)
"""
import uuid
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.sample_data import (
    ORGANISATIONS, BATCHES, DEVICES, COLLECTORS, CERTIFICATES,
    next_org_id, next_batch_id, get_impact_totals
)
from dsa.decision_tree import DeviceTriageDecisionTree
from dsa.greedy import maximise_epr_value
from dsa.bst import BinarySearchTree

router = APIRouter()

# ─── MODULE 0: Registry & Visibility ──────────────────────────────────────────

class OrgRegister(BaseModel):
    name: str
    gst_number: str
    org_type: str
    address: str
    city: str
    lat: float = 12.9716
    lng: float = 77.5946
    employee_count: int = 0

@router.get("/orgs")
def list_all_orgs():
    return {"organisations": list(ORGANISATIONS.values()), "total": len(ORGANISATIONS)}

@router.get("/orgs/{city}")
def get_orgs_by_city(city: str):
    result = [o for o in ORGANISATIONS.values() if o["city"].lower() == city.lower()]
    return {"organisations": result, "city": city}

@router.post("/register")
def register_org(org: OrgRegister):
    new_id = next_org_id()
    entry = {
        "id": new_id,
        "name": org.name,
        "gst_number": org.gst_number,
        "org_type": org.org_type,
        "address": org.address,
        "city": org.city,
        "lat": org.lat,
        "lng": org.lng,
        "employee_count": org.employee_count,
        "epr_obligation_kg": max(50, org.employee_count * 0.2),
        "registered_at": "2024-04-22",
    }
    ORGANISATIONS[new_id] = entry
    return {"org_id": new_id, "message": "Organisation registered successfully", "data": entry}

# ─── MODULE 1: Device Triage Engine ───────────────────────────────────────────

@router.get("/devices")
def list_devices():
    return {"devices": list(DEVICES.values())}

class BatchSubmit(BaseModel):
    org_id: int
    devices: List[dict]   # [{"device_id": 1, "quantity": 5}, ...]

@router.post("/batch/create")
def create_batch(batch: BatchSubmit):
    if batch.org_id not in ORGANISATIONS:
        raise HTTPException(status_code=404, detail="Organisation not found")

    batch_uid = f"BATCH-{uuid.uuid4().hex[:8].upper()}"
    total_devices = 0
    estimated_weight = 0.0
    epr_credit = 0.0
    enriched_devices = []

    # Decision Tree triage
    triage_tree = DeviceTriageDecisionTree()

    for item in batch.devices:
        dev_id = item.get("device_id")
        qty = item.get("quantity", 1)
        dev = DEVICES.get(dev_id)
        if dev:
            total_devices += qty
            estimated_weight += dev["avg_weight_kg"] * qty
            epr_credit += qty * 0.5
            triage_label = triage_tree.classify(dev["category"])
            enriched_devices.append({
                "device_id": dev_id,
                "name": dev["name"],
                "quantity": qty,
                "triage_class": triage_label,
                "subtotal_kg": round(dev["avg_weight_kg"] * qty, 2),
            })

    new_id = next_batch_id()
    entry = {
        "id": new_id,
        "batch_uid": batch_uid,
        "org_id": batch.org_id,
        "devices": enriched_devices,
        "total_devices": total_devices,
        "estimated_weight_kg": round(estimated_weight, 2),
        "epr_credit_estimate": round(epr_credit, 2),
        "status": "pending",
        "collector_id": None,
        "recycler_id": None,
        "created_at": "2024-04-22",
        "collected_at": None,
        "received_at": None,
        "certified_at": None,
    }
    BATCHES[new_id] = entry
    return {"batch_id": new_id, "batch_uid": batch_uid, "data": entry,
            "message": "Batch created & triaged successfully"}

@router.get("/batch/{batch_id}")
def get_batch(batch_id: int):
    b = BATCHES.get(batch_id)
    if not b:
        raise HTTPException(status_code=404, detail="Batch not found")
    return b

@router.get("/org/{org_id}/batches")
def get_org_batches(org_id: int):
    result = [b for b in BATCHES.values() if b["org_id"] == org_id]
    return {"batches": result, "total": len(result)}

# ─── MODULE 2: Collector Matching (Greedy + KD-Tree) ──────────────────────────

@router.get("/match-collectors/{org_id}")
def match_collectors(org_id: int):
    """
    Greedy collector matching: rank collectors by weight-capacity score.
    DSA: Greedy algorithm scans all collectors and selects best fit.
    """
    org = ORGANISATIONS.get(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")

    # Get org's pending batches
    pending = [b for b in BATCHES.values() if b["org_id"] == org_id and b["status"] == "pending"]
    total_pending_weight = sum(b["estimated_weight_kg"] for b in pending)

    # Greedy scoring: proximity + capacity
    scored = []
    for c in COLLECTORS.values():
        if not c["is_available"]:
            continue
        dist = ((org["lat"] - c["lat"])**2 + (org["lng"] - c["lng"])**2) ** 0.5
        capacity_score = min(c["weekly_capacity_kg"] / max(total_pending_weight, 1), 5.0)
        proximity_score = max(0, 10 - dist * 100)
        total_score = round((capacity_score * 0.5 + proximity_score * 0.3 + c["rating"] * 0.2), 2)
        scored.append({**c, "match_score": total_score, "distance_approx": round(dist * 111, 1)})  # 1 deg ≈ 111 km

    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return {
        "org_id": org_id,
        "org_city": org["city"],
        "pending_weight_kg": total_pending_weight,
        "dsa_used": "Greedy Algorithm — scores collectors by capacity × proximity × rating",
        "recommended_collectors": scored[:4],
    }

# ─── MODULE 3: EPR Compliance Dashboard (BST + Greedy range analysis) ──────────

@router.get("/epr-dashboard/{org_id}")
def epr_dashboard(org_id: int):
    """
    DSA 1 — BST: insert all batches keyed by epr_credit_estimate; inorder gives
             them sorted ascending for O(log n) range queries.
    DSA 2 — Greedy (maximise_epr_value): reorder cert data by EPR credit desc
             to show which certificates contribute most to compliance, fast.
    """
    org = ORGANISATIONS.get(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")

    org_batches   = [b for b in BATCHES.values() if b["org_id"] == org_id]
    org_certs     = [c for c in CERTIFICATES.values() if c["org_id"] == org_id]
    certified_kg  = sum(c["weight_kg"] for c in org_certs)
    co2_avoided   = sum(c["co2_avoided_kg"] for c in org_certs)
    obligation    = org["epr_obligation_kg"]
    compliance_pct = min(100, round((certified_kg / obligation) * 100, 1)) if obligation else 0

    # ── DSA 1: BST — insert batches keyed by EPR credit, inorder = sorted ───
    bst = BinarySearchTree()
    for b in org_batches:
        bst.insert(b["epr_credit_estimate"], b)          # ← actual BST.insert
    sorted_by_epr = bst.inorder_traversal()              # ← actual BST inorder
    # Also demonstrate range_query: batches with EPR credit between 10 and 200
    epr_range_query = bst.range_query(10, 200)

    # ── DSA 2: Greedy — rank cert contributions by EPR value ─────────────────
    cert_classified = [
        {
            "classification": (
                "refurbish" if c.get("devices_refurbished", 0) > 10 else
                "hazardous" if c.get("copper_recovered_kg", 0) > 8 else "recycle"
            ),
            "weight_kg":      c["weight_kg"],
            "copper_kg":      c.get("copper_recovered_kg", 0),
            "gold_g":         c.get("gold_recovered_g", 0),
            "cadmium_g":      0,
        }
        for c in org_certs
    ]
    greedy_result = maximise_epr_value(cert_classified)  # ← actual Greedy call

    status_counts = {}
    for b in org_batches:
        status_counts[b["status"]] = status_counts.get(b["status"], 0) + 1

    return {
        "org": org,
        "compliance_pct": compliance_pct,
        "certified_weight_kg": round(certified_kg, 2),
        "obligation_kg": obligation,
        "co2_avoided_kg": round(co2_avoided, 2),
        "certificates": org_certs,
        "batches": org_batches,
        "batches_sorted_by_epr": sorted_by_epr,
        "epr_range_10_to_200": epr_range_query,
        "greedy_cert_ranking": greedy_result,
        "status_counts": status_counts,
        "dsa_used": "BST (EPR credit sort + range query) + Greedy (maximise EPR value ordering)",
    }
