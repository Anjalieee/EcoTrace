"""
Bulk Consumer Portal Routes — In-Memory (No DB)
Modules: 0-Registry, 1-Device Triage, 2-Collector Matching, 3-EPR Dashboard
DSA Used: Decision Tree (triage), Greedy + KD-Tree (collector match), BST (EPR range query)
"""
import uuid
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from dsa.kd_tree import KDTree, collector_tree, recycler_tree
from dsa.trie import device_trie

import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.sample_data import (
    ORGANISATIONS, BATCHES, DEVICES, COLLECTORS, RECYCLERS, CERTIFICATES,
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

@router.get("/devices/search")
def search_devices(q: str, limit: int = 10):
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 100")
    return device_trie.autocomplete(q.strip(), limit) if q.strip() else []

class BatchSubmit(BaseModel):
    org_id: int
    devices: List[dict]   # [{"device_id": 1, "quantity": 5}, ...]

class PickupRequest(BaseModel):
    provider_type: str
    provider_id: int

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

@router.post("/batch/{batch_id}/pickup-request")
def request_pickup(batch_id: int, request: PickupRequest):
    batch = BATCHES.get(batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    if batch["status"] != "pending":
        raise HTTPException(status_code=400, detail="Pickup can only be requested for pending batches")

    if request.provider_type == "collector":
        provider = COLLECTORS.get(request.provider_id)
        if not provider or not provider["is_available"]:
            raise HTTPException(status_code=404, detail="Available collector not found")
        batch["collector_id"] = request.provider_id
        batch["status"] = "collector_assigned"
    elif request.provider_type == "recycler":
        provider = RECYCLERS.get(request.provider_id)
        if not provider or not provider["is_available"]:
            raise HTTPException(status_code=404, detail="Available recycler not found")
        batch["requested_recycler_id"] = request.provider_id
    else:
        raise HTTPException(status_code=400, detail="Provider type must be collector or recycler")

    batch["pickup_request"] = {
        "provider_type": request.provider_type,
        "provider_id": request.provider_id,
    }
    return {
        "message": "Pickup request submitted",
        "batch_uid": batch["batch_uid"],
        "provider_type": request.provider_type,
        "provider_name": provider["name"],
        "status": batch["status"],
    }

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

    # Greedy scoring is limited to available collectors serving this city.
    scored = []
    for c in COLLECTORS.values():
        if not c["is_available"] or c["city"].casefold() != org["city"].casefold():
            continue
        dist = KDTree.haversine_km(
            (float(org["lat"]), float(org["lng"])),
            (float(c["lat"]), float(c["lng"])),
        )
        if dist > float(c.get("service_radius_km", 9999)):
            continue
        capacity_score = min(c["weekly_capacity_kg"] / max(total_pending_weight, 1), 5.0)
        proximity_score = max(0, 10 - dist / 10)
        total_score = round((capacity_score * 0.5 + proximity_score * 0.3 + c["rating"] * 0.2), 2)
        scored.append({**c, "match_score": total_score, "distance_approx": round(dist, 1)})

    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return {
        "org_id": org_id,
        "org_city": org["city"],
        "pending_weight_kg": total_pending_weight,
        "dsa_used": "Greedy Algorithm — scores collectors by capacity × proximity × rating",
        "recommended_collectors": scored[:4],
    }

# ─── MODULE 3: EPR Compliance Dashboard (BST + Greedy range analysis) ──────────
@router.get("/nearby-collectors")
def get_nearby_collectors(lat: float, lng: float, k: int = 3, radius_km: float = 30, city: Optional[str] = None):
    """
    k-d Tree query. radius_km defaults to 30 —
    only collectors within 30km of the query point are returned.
    """
    return collector_tree.find_within_radius(
        (lat, lng), radius_km, k, city=city, available_only=True
    )


@router.get("/nearby-recyclers")
def get_nearby_recyclers(lat: float, lng: float, k: int = 3, radius_km: float = 30, city: Optional[str] = None):
    return recycler_tree.find_within_radius(
        (lat, lng), radius_km, k, city=city, available_only=True
    )

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

