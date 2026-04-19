from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import json
import uuid
from db.connection import get_connection, execute_insert_update, query_all, query_one

router = APIRouter()

class RecyclerRegister(BaseModel):
    name: str
    registration_number: str
    address: str
    city: str
    lat: float
    lng: float
    specialisation: str  # it_equipment, batteries, large_appliances, mixed
    weekly_capacity_kg: float = 1000
    accepted_types: List[str] = []

class CertificateIssue(BaseModel):
    batch_id: int
    org_id: int
    collector_id: int
    weight_kg: float
    copper_recovered_kg: float = 0
    gold_recovered_g: float = 0
    devices_refurbished: int = 0
    co2_avoided_kg: float = 0

@router.post("/register")
def register_recycler(recycler: RecyclerRegister):
    """Register a recycler facility."""
    sql = """
    INSERT INTO recyclers (name, registration_number, address, city, lat, lng, 
                          specialisation, weekly_capacity_kg, accepted_types)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        recycler_id = execute_insert_update(sql, (
            recycler.name, recycler.registration_number, recycler.address, recycler.city,
            recycler.lat, recycler.lng, recycler.specialisation, recycler.weekly_capacity_kg,
            json.dumps(recycler.accepted_types)
        ))
        return {"recycler_id": recycler_id, "message": "Recycler registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{recycler_id}")
def get_recycler(recycler_id: int):
    """Get recycler details."""
    sql = "SELECT * FROM recyclers WHERE id = %s"
    recycler = query_one(sql, (recycler_id,))
    if not recycler:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recycler not found")
    return recycler

@router.get("/{recycler_id}/received")
def get_received_batches(recycler_id: int):
    """Get batches received at a recycler."""
    sql = "SELECT * FROM batches WHERE recycler_id = %s ORDER BY created_at DESC"
    batches = query_all(sql, (recycler_id,))
    return {"batches": batches}

@router.patch("/batch/{batch_id}/receive")
def mark_batch_received(batch_id: int, recycler_id: int):
    """Mark a batch as received at recycler."""
    sql = "UPDATE batches SET recycler_id = %s, status = %s, received_at = NOW() WHERE id = %s"
    try:
        execute_insert_update(sql, (recycler_id, "at_recycler", batch_id))
        return {"message": "Batch marked as received"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/certificate/issue")
def issue_certificate(cert: CertificateIssue):
    """Issue an EPR certificate for a processed batch."""
    certificate_uid = f"CERT-{uuid.uuid4().hex[:8].upper()}"
    
    sql = """
    INSERT INTO certificates (certificate_uid, batch_id, org_id, collector_id, recycler_id,
                              weight_kg, copper_recovered_kg, gold_recovered_g, 
                              devices_refurbished, co2_avoided_kg)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        cert_id = execute_insert_update(sql, (
            certificate_uid, cert.batch_id, cert.org_id, cert.collector_id,
            router.state.current_recycler_id,  # Get from context
            cert.weight_kg, cert.copper_recovered_kg, cert.gold_recovered_g,
            cert.devices_refurbished, cert.co2_avoided_kg
        ))
        
        # Update batch status
        update_sql = "UPDATE batches SET status = %s, certified_at = NOW() WHERE id = %s"
        execute_insert_update(update_sql, ("certified", cert.batch_id))
        
        return {
            "certificate_id": cert_id,
            "certificate_uid": certificate_uid,
            "message": "Certificate issued successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/certificate/{cert_id}")
def get_certificate(cert_id: int):
    """Get certificate details."""
    sql = "SELECT * FROM certificates WHERE id = %s"
    cert = query_one(sql, (cert_id,))
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found")
    return cert
