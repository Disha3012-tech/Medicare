from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.models import (
    Prescription, PrescriptionMedicine, Doctor, Patient, User, Role, NotificationType, Notification
)
from app.schemas.prescription import PrescriptionCreate, PrescriptionOut
from app.core.deps import require_roles, get_current_user
from app.ws.manager import manager

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])


def _serialize_prescription(prescription: Prescription, db: Session) -> PrescriptionOut:
    doctor = db.query(Doctor).options(joinedload(Doctor.user)).filter(Doctor.id == prescription.doctor_id).first()
    patient = db.query(Patient).options(joinedload(Patient.user)).filter(Patient.id == prescription.patient_id).first()

    patient_age = None
    if patient and patient.date_of_birth:
        now = datetime.now(timezone.utc)
        patient_age = (now.date() - patient.date_of_birth.date()).days // 365

    return PrescriptionOut(
        id=prescription.id,
        appointment_id=prescription.appointment_id,
        patient_id=prescription.patient_id,
        doctor_id=prescription.doctor_id,
        diagnosis=prescription.diagnosis,
        notes=prescription.notes,
        issued_at=prescription.issued_at,
        medicines=prescription.medicines,
        doctor_name=f"Dr. {doctor.user.first_name} {doctor.user.last_name}" if doctor and doctor.user else "Unknown",
        specialty=doctor.specialty if doctor else "",
        doctor_avatar_url=doctor.user.avatar_url if doctor and doctor.user else None,
        patient_name=f"{patient.user.first_name} {patient.user.last_name}" if patient and patient.user else "Unknown",
        patient_age=patient_age,
    )


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

    return _serialize_prescription(prescription, db)


@router.get("/mine", response_model=List[PrescriptionOut])
def list_my_prescriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == Role.PATIENT:
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        prescriptions = db.query(Prescription).filter(Prescription.patient_id == patient.id).order_by(Prescription.issued_at.desc()).all()
    elif current_user.role == Role.DOCTOR:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        prescriptions = db.query(Prescription).filter(Prescription.doctor_id == doctor.id).order_by(Prescription.issued_at.desc()).all()
    else:
        prescriptions = []

    return [_serialize_prescription(p, db) for p in prescriptions]


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

    return _serialize_prescription(prescription, db)