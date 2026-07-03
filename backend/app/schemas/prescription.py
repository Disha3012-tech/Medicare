from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class MedicineIn(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None


class MedicineOut(MedicineIn):
    id: str

    class Config:
        from_attributes = True


class PrescriptionCreate(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    medicines: List[MedicineIn] = []


class PrescriptionOut(BaseModel):
    id: str
    appointment_id: Optional[str] = None
    patient_id: str
    doctor_id: str
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    issued_at: datetime
    medicines: List[MedicineOut] = []

    class Config:
        from_attributes = True