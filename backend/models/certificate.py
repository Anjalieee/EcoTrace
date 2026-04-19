from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CertificateCreate(BaseModel):
    batch_id: int
    org_id: int
    collector_id: int
    recycler_id: int
    weight_kg: float
    copper_recovered_kg: Optional[float] = 0
    gold_recovered_g: Optional[float] = 0
    devices_refurbished: Optional[int] = 0
    co2_avoided_kg: Optional[float] = 0

class Certificate(BaseModel):
    id: int
    certificate_uid: str
    batch_id: int
    org_id: int
    collector_id: int
    recycler_id: int
    weight_kg: float
    copper_recovered_kg: float
    gold_recovered_g: float
    devices_refurbished: int
    co2_avoided_kg: float
    issued_at: datetime

    class Config:
        from_attributes = True
