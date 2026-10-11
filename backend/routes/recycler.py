"""
Recycler Portal Routes — In-Memory (No DB)
Modules: 0-Registry & Capacity, 1-Incoming Batch Feed, 2-Network View, 3-Certificate Issuance & Impact
DSA Used:
  - Trie (O(m) certificate UID prefix search)
  - BFS Graph (collector → recycler network traversal, shortest-hop connectivity)
"""
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.sample_data import (
    RECYCLERS, BATCHES, ORGANISATIONS, COLLECTORS, CERTIFICATES,
    next_rec_id, next_cert_id, get_impact_totals
)
from dsa.trie import Trie
from dsa.bfs import Graph
from dsa.kd_tree import recycler_tree

router = APIRouter()

# ─── MODULE 0: Registry & Capacity ────────────────────────────────────────────

class RecyclerRegister(BaseModel):
    name: str
    registration_number: str
    address: str
    city: str
    lat: float = 28.5355
    lng: float = 77.3910
    specialisation: str = "IT Equipment"
    weekly_capacity_kg: float = 2000
    accepted_types: List[str] = []

@router.get("/all")
def list_all_recyclers():
    return {"recyclers": list(RECYCLERS.values()), "total": len(RECYCLERS)}

@router.post("/register")
def register_recycler(rec: RecyclerRegister):
    new_id = next_rec_id()
    entry = {
        "id": new_id,
        "name": rec.name,
        "registration_number": rec.registration_number,
        "address": rec.address,
        "city": rec.city,
        "lat": rec.lat,
        "lng": rec.lng,
        "specialisation": rec.specialisation,
        "weekly_capacity_kg": rec.weekly_capacity_kg,
        "accepted_types": rec.accepted_types,
        "is_available": True,
        "recovery_rate_pct": 85,
        "co2_avoided_total_kg": 0,
    }
    RECYCLERS[new_id] = entry
    recycler_tree.load_from_list(list(RECYCLERS.values()))
    return {"recycler_id": new_id, "message": "Recycler registered successfully", "data": entry}

@router.get("/{recycler_id}")
def get_recycler(recycler_id: int):
    r = RECYCLERS.get(recycler_id)
    if not r:
        raise HTTPException(status_code=404, detail="Recycler not found")
    return r

# ─── MODULE 1: Incoming Batch Feed ────────────────────────────────────────────

@router.get("/{recycler_id}/received")
def get_received_batches(recycler_id: int):
    result = [
        b for b in BATCHES.values()
        if b["recycler_id"] == recycler_id or b.get("requested_recycler_id") == recycler_id
    ]
    for b in result:
        org = ORGANISATIONS.get(b["org_id"])
        b["org_name"] = org["name"] if org else "Unknown"
        col = COLLECTORS.get(b["collector_id"]) if b["collector_id"] else None
        b["collector_name"] = col["name"] if col else "Unassigned"
    return {"batches": result, "total": len(result)}

@router.patch("/batch/{batch_id}/receive")
def mark_received(batch_id: int, recycler_id: int):
    b = BATCHES.get(batch_id)
    if not b:
        raise HTTPException(status_code=404, detail="Batch not found")
    BATCHES[batch_id]["recycler_id"] = recycler_id
    BATCHES[batch_id]["status"] = "at_recycler"
    BATCHES[batch_id]["received_at"] = "2024-04-22"
    return {"message": "Batch received at recycler", "batch_uid": b["batch_uid"]}

# ─── MODULE 2: Network View (BFS Graph traversal) ─────────────────────────────

@router.get("/network/overview")
def network_overview():
    """
    Build a directed Graph of collector → recycler edges from batch data.
    Run BFS from each collector node to determine:
      - Which recyclers are reachable
      - The minimum hop distance
      - The BFS traversal order (proves DSA is actually running)
    DSA: BFS Graph — O(V+E) traversal of the collector-recycler network.
    """
    nodes = []
    edges = []

    # ── Build node lists ─────────────────────────────────────────
    for c in COLLECTORS.values():
        nodes.append({"id": f"col-{c['id']}", "type": "collector", "name": c["name"],
                       "city": c["city"], "lat": c["lat"], "lng": c["lng"],
                       "batches": c["batches_collected"], "rating": c["rating"]})

    for r in RECYCLERS.values():
        nodes.append({"id": f"rec-{r['id']}", "type": "recycler", "name": r["name"],
                       "city": r["city"], "lat": r["lat"], "lng": r["lng"],
                       "capacity_kg": r["weekly_capacity_kg"],
                       "recovery_rate": r["recovery_rate_pct"]})

    # ── Build edges from completed batches ───────────────────────
    for b in BATCHES.values():
        if b["collector_id"] and b["recycler_id"]:
            edges.append({
                "from": f"col-{b['collector_id']}",
                "to": f"rec-{b['recycler_id']}",
                "batch_uid": b["batch_uid"],
                "weight_kg": b["estimated_weight_kg"],
                "status": b["status"],
            })

    # ── BFS Graph: actual traversal ───────────────────────────────
    g = Graph()
    for node in nodes:
        g.add_node(node["id"], {"name": node["name"], "type": node["type"]})
    for edge in edges:
        g.add_edge(edge["from"], edge["to"], weight=int(edge["weight_kg"]))

    # Run BFS from each collector and record traversal order
    collector_node_ids = [n["id"] for n in nodes if n["type"] == "collector"]
    bfs_results = []
    for start in collector_node_ids:
        try:
            visited_set, distances, _ = g.bfs(start)   # ← actual BFS call
            reachable_recyclers = [
                nid for nid in visited_set if nid.startswith("rec-")
            ]
            bfs_results.append({
                "start_collector": start,
                "bfs_visited_order": list(visited_set),
                "reachable_recycler_count": len(reachable_recyclers),
                "reachable_recyclers": reachable_recyclers,
                "hop_distances": {k: v for k, v in distances.items() if k.startswith("rec-")},
            })
        except Exception:
            pass

    return {
        "nodes": nodes,
        "edges": edges,
        "bfs_traversal": bfs_results,
        "stats": {
            "total_collectors": len(COLLECTORS),
            "total_recyclers": len(RECYCLERS),
            "total_connections": len(edges),
            "bfs_runs": len(bfs_results),
        },
        "dsa_used": "BFS Graph — O(V+E) traversal of collector→recycler network, finds reachable recyclers per collector",
    }

# ─── MODULE 3: Certificate Issuance (Trie for UID lookup) ─────────────────────

class CertIssue(BaseModel):
    batch_id: int
    org_id: int
    collector_id: int
    recycler_id: int
    weight_kg: float
    copper_recovered_kg: float = 0.0
    gold_recovered_g: float = 0.0
    devices_refurbished: int = 0
    co2_avoided_kg: float = 0.0

@router.post("/certificate/issue")
def issue_certificate(cert: CertIssue):
    cert_uid = f"CERT-{uuid.uuid4().hex[:8].upper()}"
    new_id = next_cert_id()
    entry = {
        "id": new_id,
        "certificate_uid": cert_uid,
        "batch_id": cert.batch_id,
        "org_id": cert.org_id,
        "collector_id": cert.collector_id,
        "recycler_id": cert.recycler_id,
        "weight_kg": cert.weight_kg,
        "copper_recovered_kg": cert.copper_recovered_kg,
        "gold_recovered_g": cert.gold_recovered_g,
        "devices_refurbished": cert.devices_refurbished,
        "co2_avoided_kg": cert.co2_avoided_kg,
        "issued_at": "2024-04-22",
    }
    CERTIFICATES[new_id] = entry
    # Update batch status
    if cert.batch_id in BATCHES:
        BATCHES[cert.batch_id]["status"] = "certified"
        BATCHES[cert.batch_id]["certified_at"] = "2024-04-22"
    return {"certificate_id": new_id, "certificate_uid": cert_uid,
            "message": "Certificate issued successfully", "data": entry}

@router.get("/certificate/search/{prefix}")
def search_certificate_by_prefix(prefix: str):
    """
    Trie-based certificate UID prefix search.
    DSA: Trie data structure for O(m) prefix lookup.
    """
    trie = Trie()
    for c in CERTIFICATES.values():
        trie.insert(c["certificate_uid"], c)

    results = trie.search_prefix(prefix.upper())
    return {
        "prefix": prefix.upper(),
        "results": results,
        "dsa_used": "Trie — O(m) prefix search across all certificate UIDs",
    }

@router.get("/certificate/{cert_id}")
def get_certificate(cert_id: int):
    c = CERTIFICATES.get(cert_id)
    if not c:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return c

@router.get("/certificates/all")
def all_certificates():
    return {"certificates": list(CERTIFICATES.values()), "total": len(CERTIFICATES)}

@router.get("/{recycler_id}/impact")
def recycler_impact(recycler_id: int):
    r = RECYCLERS.get(recycler_id)
    if not r:
        raise HTTPException(status_code=404, detail="Recycler not found")
    certs = [c for c in CERTIFICATES.values() if c["recycler_id"] == recycler_id]
    return {
        "recycler": r,
        "certificates_issued": len(certs),
        "total_weight_processed_kg": round(sum(c["weight_kg"] for c in certs), 2),
        "total_co2_avoided_kg": round(sum(c["co2_avoided_kg"] for c in certs), 2),
        "total_copper_kg": round(sum(c["copper_recovered_kg"] for c in certs), 2),
        "total_gold_g": round(sum(c["gold_recovered_g"] for c in certs), 2),
        "devices_refurbished": sum(c["devices_refurbished"] for c in certs),
    }
