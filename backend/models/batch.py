from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class DeviceItem(BaseModel):
    device_id: int
    name: str
    category: str
    quantity: int
    estimated_weight_kg: float

class BatchCreate(BaseModel):
    org_id: int
    devices: List[DeviceItem]

class Batch(BaseModel):
    id: int
    batch_uid: str
    org_id: int
    total_devices: int
    estimated_weight_kg: float
    status: str
    collector_id: Optional[int] = None
    recycler_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
