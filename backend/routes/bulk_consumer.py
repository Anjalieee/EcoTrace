from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import json
import uuid
from datetime import datetime
from db.connection import get_connection, execute_insert_update, query_all, query_one

router = APIRouter()

class OrganisationRegister(BaseModel):
    name: str
    gst_number: str
    org_type: str  # company, hospital, college, rwa, small_business
    address: str
    city: str
    lat: float
    lng: float
    employee_count: int = 0

class BatchSubmit(BaseModel):
    org_id: int
    devices: List[dict]  # [{"device_id": 1, "quantity": 5}, ...]

@router.post("/register")
def register_organisation(org: OrganisationRegister):
    """Register a bulk consumer organisation."""
    sql = """
    INSERT INTO organisations (name, gst_number, org_type, address, city, lat, lng, employee_count)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        org_id = execute_insert_update(sql, (
            org.name, org.gst_number, org.org_type, org.address, 
            org.city, org.lat, org.lng, org.employee_count
        ))
        return {"org_id": org_id, "message": "Organisation registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/orgs/{city}")
def get_organisations_by_city(city: str):
    """Get all organisations in a city."""
    sql = "SELECT * FROM organisations WHERE city = %s"
    results = query_all(sql, (city,))
    return {"organisations": results}

@router.post("/batch/create")
def create_batch(batch: BatchSubmit):
    """Create a new e-waste batch."""
    # Generate unique batch UID
    batch_uid = f"BATCH-{uuid.uuid4().hex[:8].upper()}"
    
    # Calculate totals from devices
    total_devices = sum(d.get("quantity", 1) for d in batch.devices)
    
    # Fetch device details and calculate estimated weight & EPR
    estimated_weight_kg = 0
    epr_credit_estimate = 0
    
    for device in batch.devices:
        device_sql = "SELECT avg_weight_kg FROM devices WHERE id = %s"
        device_data = query_one(device_sql, (device.get("device_id"),))
        if device_data:
            qty = device.get("quantity", 1)
            estimated_weight_kg += device_data["avg_weight_kg"] * qty
            # Simple EPR: 0.5 kg CO2 offset per device
            epr_credit_estimate += 0.5 * qty
    
    sql = """
    INSERT INTO batches (batch_uid, org_id, devices_json, total_devices, 
                         estimated_weight_kg, epr_credit_estimate, status)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    try:
        batch_id = execute_insert_update(sql, (
            batch_uid, batch.org_id, json.dumps(batch.devices), 
            total_devices, estimated_weight_kg, epr_credit_estimate, "pending"
        ))
        return {
            "batch_id": batch_id,
            "batch_uid": batch_uid,
            "total_devices": total_devices,
            "estimated_weight_kg": estimated_weight_kg,
            "epr_credit_estimate": epr_credit_estimate,
            "message": "Batch created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/batch/{batch_id}")
def get_batch(batch_id: int):
    """Get batch details."""
    sql = "SELECT * FROM batches WHERE id = %s"
    batch = query_one(sql, (batch_id,))
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
    return batch

@router.get("/org/{org_id}/batches")
def get_org_batches(org_id: int):
    """Get all batches for an organisation."""
    sql = "SELECT * FROM batches WHERE org_id = %s ORDER BY created_at DESC"
    batches = query_all(sql, (org_id,))
    return {"batches": batches}
