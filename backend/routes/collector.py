from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import json
from db.connection import get_connection, execute_insert_update, query_all, query_one

router = APIRouter()

class CollectorRegister(BaseModel):
    name: str
    registration_number: str
    address: str
    city: str
    lat: float
    lng: float
    service_radius_km: float = 10
    min_batch_kg: float = 0
    weekly_capacity_kg: float = 500
    accepted_types: List[str] = []

class BatchAssignment(BaseModel):
    batch_id: int
    collector_id: int

@router.post("/register")
def register_collector(collector: CollectorRegister):
    """Register a collector (PRO/aggregator)."""
    sql = """
    INSERT INTO collectors (name, registration_number, address, city, lat, lng, 
                           service_radius_km, min_batch_kg, weekly_capacity_kg, accepted_types)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        collector_id = execute_insert_update(sql, (
            collector.name, collector.registration_number, collector.address, collector.city,
            collector.lat, collector.lng, collector.service_radius_km, collector.min_batch_kg,
            collector.weekly_capacity_kg, json.dumps(collector.accepted_types)
        ))
        return {"collector_id": collector_id, "message": "Collector registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/available/{city}")
def get_available_collectors(city: str):
    """Get available collectors in a city."""
    sql = "SELECT * FROM collectors WHERE city = %s AND is_available = TRUE"
    collectors = query_all(sql, (city,))
    return {"collectors": collectors}

@router.get("/{collector_id}")
def get_collector(collector_id: int):
    """Get collector details."""
    sql = "SELECT * FROM collectors WHERE id = %s"
    collector = query_one(sql, (collector_id,))
    if not collector:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collector not found")
    return collector

@router.get("/{collector_id}/assigned")
def get_assigned_batches(collector_id: int):
    """Get batches assigned to a collector."""
    sql = "SELECT * FROM batches WHERE collector_id = %s ORDER BY created_at DESC"
    batches = query_all(sql, (collector_id,))
    return {"batches": batches}

@router.patch("/batch/{batch_id}/assign")
def assign_batch_to_collector(batch_id: int, collector_id: int):
    """Assign a batch to a collector."""
    sql = "UPDATE batches SET collector_id = %s, status = %s WHERE id = %s"
    try:
        execute_insert_update(sql, (collector_id, "collector_assigned", batch_id))
        return {"message": "Batch assigned to collector"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.patch("/batch/{batch_id}/collect")
def mark_batch_collected(batch_id: int):
    """Mark a batch as collected."""
    sql = "UPDATE batches SET status = %s, collected_at = NOW() WHERE id = %s"
    try:
        execute_insert_update(sql, ("collected", batch_id))
        return {"message": "Batch marked as collected"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
