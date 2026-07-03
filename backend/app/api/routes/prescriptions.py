from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import (
    Prescription, PrescriptionMedicine, Doctor, Patient, User, Role, NotificationType, Notification
)
from app.schemas.prescription import PrescriptionCreate, PrescriptionOut
from app.core.deps import require_roles, get_current_user
from app.ws.manager import manager

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])


@router.post("", response_model=PrescriptionOut, status_code=status.HTTP_201_CREATED)
async def create_prescription(
    payload: PrescriptionCreate,
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    prescription = Prescription(
        appointment_id=payload.appointment_id,
        patient_id=patient.id,
        doctor_id=doctor.id,
        diagnosis=payload.diagnosis,
        notes=payload.notes,
    )
    db.add(prescription)
    db.flush()

    for med in payload.medicines:
        db.add(PrescriptionMedicine(prescription_id=prescription.id, **med.model_dump()))

    db.add(Notification(
        user_id=patient.user_id,
        type=NotificationType.PRESCRIPTION,
        title="New prescription",
        body=f"Dr. {current_user.last_name} issued a new prescription for you.",
    ))

    db.commit()
    db.refresh(prescription)

    await manager.send_to_user(patient.user_id, {"event": "prescription:new", "prescriptionId": prescription.id})

    return prescription


@router.get("/mine", response_model=List[PrescriptionOut])
def list_my_prescriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == Role.PATIENT:
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        return db.query(Prescription).filter(Prescription.patient_id == patient.id).order_by(Prescription.issued_at.desc()).all()
    if current_user.role == Role.DOCTOR:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        return db.query(Prescription).filter(Prescription.doctor_id == doctor.id).order_by(Prescription.issued_at.desc()).all()
    return []


@router.get("/{prescription_id}", response_model=PrescriptionOut)
def get_prescription(
    prescription_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")

    if current_user.role == Role.PATIENT:
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if prescription.patient_id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your prescription")
    elif current_user.role == Role.DOCTOR:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if prescription.doctor_id != doctor.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your prescription")

    return prescription