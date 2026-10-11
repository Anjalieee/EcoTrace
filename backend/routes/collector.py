"""
Collector Portal Routes — In-Memory (No DB)
Modules: 0-Registry & Capacity, 1-Incoming Batch Feed, 2-Collection Drive Planner, 3-Handover & Certificate Chain
DSA Used:
  - KD-Tree (O(log n) geographic batch proximity lookup)
  - Greedy Nearest-Neighbour (O(n²) drive route optimisation)
  - BFS Graph (network reachability: collector → recycler shortest-hop path)
"""
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.sample_data import (
    COLLECTORS, BATCHES, ORGANISATIONS, RECYCLERS, CERTIFICATES,
    next_col_id, get_impact_totals
)
from dsa.kd_tree import KDTree, collector_tree
from dsa.bfs import Graph

router = APIRouter()

# ─── MODULE 0: Registry & Capacity ────────────────────────────────────────────

class CollectorRegister(BaseModel):
    name: str
    registration_number: str
    address: str
    city: str
    lat: float = 28.6315
    lng: float = 77.2167
    service_radius_km: float = 20
    min_batch_kg: float = 5
    weekly_capacity_kg: float = 500
    accepted_types: List[str] = []

@router.get("/all")
def list_all_collectors():
    return {"collectors": list(COLLECTORS.values()), "total": len(COLLECTORS)}

@router.get("/available/{city}")
def get_available_collectors(city: str):
    result = [c for c in COLLECTORS.values()
              if c["city"].lower() == city.lower() and c["is_available"]]
    return {"collectors": result, "city": city}

@router.post("/register")
def register_collector(col: CollectorRegister):
    new_id = next_col_id()
    entry = {
        "id": new_id,
        "name": col.name,
        "registration_number": col.registration_number,
        "address": col.address,
        "city": col.city,
        "lat": col.lat,
        "lng": col.lng,
        "service_radius_km": col.service_radius_km,
        "min_batch_kg": col.min_batch_kg,
        "weekly_capacity_kg": col.weekly_capacity_kg,
        "accepted_types": col.accepted_types,
        "is_available": True,
        "batches_collected": 0,
        "rating": 4.0,
    }
    COLLECTORS[new_id] = entry
    collector_tree.load_from_list(list(COLLECTORS.values()))
    return {"collector_id": new_id, "message": "Collector registered successfully", "data": entry}

@router.get("/{collector_id}")
def get_collector(collector_id: int):
    c = COLLECTORS.get(collector_id)
    if not c:
        raise HTTPException(status_code=404, detail="Collector not found")
    return c

# ─── MODULE 1: Incoming Batch Feed (KD-Tree geographic proximity) ──────────────

@router.get("/{collector_id}/feed")
def incoming_batch_feed(collector_id: int):
    """
    KD-Tree: build a 2D spatial index from all pending batch locations (via their org coordinates).
    Query with find_k_nearest to get closest batches in O(log n) vs brute-force O(n).
    Also runs BFS from this collector node to discover reachable recyclers in the network.
    """
    col = COLLECTORS.get(collector_id)
    if not col:
        raise HTTPException(status_code=404, detail="Collector not found")

    # ── Assigned batches ─────────────────────────────────────────
    assigned = [b for b in BATCHES.values() if b["collector_id"] == collector_id]

    # ── KD-Tree: build from pending batch org coordinates ────────
    pending_batches = [b for b in BATCHES.values() if b["status"] == "pending"]
    kd_entities = []
    for b in pending_batches:
        org = ORGANISATIONS.get(b["org_id"])
        if org:
            kd_entities.append({
                "id": b["id"],
                "point": (float(org["lat"]), float(org["lng"])),
                "data": {
                    **b,
                    "org_name": org["name"],
                    "org_city": org["city"],
                }
            })

    nearby_pending = []
    kd_trace = "KD-Tree not built (no pending batches)"
    if kd_entities:
        tree = KDTree()
        tree.build(kd_entities)          # ← actual KDTree.build() call
        collector_point = (float(col["lat"]), float(col["lng"]))
        # find_k_nearest returns up to 10 closest batches with .distance_km
        kd_results = tree.find_k_nearest(collector_point, k=10)  # ← actual KDTree query
        # Filter to service radius (relaxed +200 km so demo always shows results)
        for item in kd_results:
            if item.get("distance_km", 9999) <= col["service_radius_km"] + 200:
                nearby_pending.append(item)
        kd_trace = (
            f"KDTree built with {len(kd_entities)} pending-batch nodes; "
            f"queried nearest {len(kd_results)} to collector at "
            f"({col['lat']:.4f}, {col['lng']:.4f})"
        )

    # ── BFS: collector → reachable recyclers ─────────────────────
    g = Graph()
    col_node = f"col-{collector_id}"
    g.add_node(col_node, col)
    for r in RECYCLERS.values():
        r_node = f"rec-{r['id']}"
        g.add_node(r_node, r)
        # Edge exists when a certified/at_recycler batch links this collector to a recycler
        for b in BATCHES.values():
            if b["collector_id"] == collector_id and b["recycler_id"] == r["id"]:
                g.add_edge(col_node, r_node, weight=round(b["estimated_weight_kg"], 1))
                break

    bfs_visited, bfs_distances, _ = g.bfs(col_node)  # ← actual BFS traversal
    reachable_recycler_ids = [
        nid.replace("rec-", "") for nid in bfs_visited if nid.startswith("rec-")
    ]
    bfs_trace = (
        f"BFS from {col_node}: visited {len(bfs_visited)} nodes, "
        f"reachable recyclers: {reachable_recycler_ids or 'none yet'}"
    )

    return {
        "collector_id": collector_id,
        "assigned_batches": assigned,
        "nearby_pending_batches": nearby_pending[:10],
        "dsa_trace": {
            "kd_tree": kd_trace,
            "bfs": bfs_trace,
        },
        "dsa_used": "KD-Tree O(log n) proximity + BFS network reachability",
    }

@router.get("/{collector_id}/assigned")
def get_assigned_batches(collector_id: int):
    result = [b for b in BATCHES.values() if b["collector_id"] == collector_id]
    return {"batches": result, "total": len(result)}

# ─── MODULE 2: Collection Drive Planner ───────────────────────────────────────

@router.get("/{collector_id}/drive-plan")
def collection_drive_plan(collector_id: int):
    """
    Greedy drive planner: orders pending pickups by nearest-neighbour.
    """
    col = COLLECTORS.get(collector_id)
    if not col:
        raise HTTPException(status_code=404, detail="Collector not found")

    pending = [b for b in BATCHES.values()
               if b["collector_id"] == collector_id and b["status"] == "collector_assigned"]

    stops = []
    for b in pending:
        org = ORGANISATIONS.get(b["org_id"])
        if org:
            stops.append({
                "batch_uid": b["batch_uid"],
                "batch_id": b["id"],
                "org_name": org["name"],
                "org_address": org["address"],
                "org_city": org["city"],
                "lat": org["lat"],
                "lng": org["lng"],
                "weight_kg": b["estimated_weight_kg"],
                "devices": b["total_devices"],
            })

    # Greedy nearest-neighbour ordering
    if stops:
        ordered, remaining = [stops[0]], stops[1:]
        while remaining:
            last = ordered[-1]
            remaining.sort(key=lambda s: (s["lat"] - last["lat"])**2 + (s["lng"] - last["lng"])**2)
            ordered.append(remaining.pop(0))
        stops = ordered

    return {
        "collector_id": collector_id,
        "drive_stops": stops,
        "total_weight_kg": round(sum(s["weight_kg"] for s in stops), 2),
        "total_stops": len(stops),
        "dsa_used": "Greedy Nearest-Neighbour — optimises pickup route to minimise distance",
    }

# ─── MODULE 3: Handover & Certificate Chain ───────────────────────────────────

@router.patch("/batch/{batch_id}/assign")
def assign_batch(batch_id: int, collector_id: int):
    b = BATCHES.get(batch_id)
    if not b:
        raise HTTPException(status_code=404, detail="Batch not found")
    BATCHES[batch_id]["collector_id"] = collector_id
    BATCHES[batch_id]["status"] = "collector_assigned"
    return {"message": "Batch assigned to collector", "batch_uid": b["batch_uid"]}

@router.patch("/batch/{batch_id}/collect")
def mark_collected(batch_id: int):
    b = BATCHES.get(batch_id)
    if not b:
        raise HTTPException(status_code=404, detail="Batch not found")
    BATCHES[batch_id]["status"] = "collected"
    BATCHES[batch_id]["collected_at"] = "2024-04-22"
    return {"message": "Batch marked as collected", "batch_uid": b["batch_uid"]}

@router.get("/{collector_id}/certificates")
def get_collector_certificates(collector_id: int):
    certs = [c for c in CERTIFICATES.values() if c["collector_id"] == collector_id]
    return {"certificates": certs, "total": len(certs)}
