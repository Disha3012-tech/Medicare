from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Patient, User, Role, EmergencyContact, InsuranceInfo
from app.schemas.patient import PatientOut, PatientUpdate, EmergencyContactIn, InsuranceInfoIn
from app.core.deps import require_roles

router = APIRouter(prefix="/patients", tags=["patients"])
from app.schemas.patient import EmergencyContactOut, InsuranceInfoOut


@router.get("/me/emergency-contact", response_model=Optional[EmergencyContactOut])
def get_my_emergency_contact(
    current_user: User = Depends(require_roles(Role.PATIENT)),
    db: Session = Depends(get_db),
):
    patient = _get_patient_or_404(db, current_user.id)
    contact = db.query(EmergencyContact).filter(EmergencyContact.patient_id == patient.id).first()
    if not contact:
        return None
    return EmergencyContactOut(name=contact.name, relationship=contact.relationship_, phone=contact.phone, email=contact.email)


@router.get("/me/insurance", response_model=Optional[InsuranceInfoOut])
def get_my_insurance(
    current_user: User = Depends(require_roles(Role.PATIENT)),
    db: Session = Depends(get_db),
):
    patient = _get_patient_or_404(db, current_user.id)
    insurance = db.query(InsuranceInfo).filter(InsuranceInfo.patient_id == patient.id).first()
    return insurance

def _get_patient_or_404(db: Session, user_id: str) -> Patient:
    patient = db.query(Patient).filter(Patient.user_id == user_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found")
    return patient


@router.get("/me", response_model=PatientOut)
def get_my_profile(
    current_user: User = Depends(require_roles(Role.PATIENT)),
    db: Session = Depends(get_db),
):
    return _get_patient_or_404(db, current_user.id)


@router.patch("/me", response_model=PatientOut)
def update_my_profile(
    payload: PatientUpdate,
    current_user: User = Depends(require_roles(Role.PATIENT)),
    db: Session = Depends(get_db),
):
    patient = _get_patient_or_404(db, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return patient


@router.put("/me/emergency-contact", status_code=status.HTTP_200_OK)
def upsert_emergency_contact(
    payload: EmergencyContactIn,
    current_user: User = Depends(require_roles(Role.PATIENT)),
    db: Session = Depends(get_db),
):
    patient = _get_patient_or_404(db, current_user.id)
    contact = db.query(EmergencyContact).filter(EmergencyContact.patient_id == patient.id).first()
    data = payload.model_dump()
    data["relationship_"] = data.pop("relationship")

    if contact:
        for field, value in data.items():
            setattr(contact, field, value)
    else:
        contact = EmergencyContact(patient_id=patient.id, **data)
        db.add(contact)

    db.commit()
    return {"success": True}


@router.put("/me/insurance", status_code=status.HTTP_200_OK)
def upsert_insurance(
    payload: InsuranceInfoIn,
    current_user: User = Depends(require_roles(Role.PATIENT)),
    db: Session = Depends(get_db),
):
    patient = _get_patient_or_404(db, current_user.id)
    insurance = db.query(InsuranceInfo).filter(InsuranceInfo.patient_id == patient.id).first()
    data = payload.model_dump()

    if insurance:
        for field, value in data.items():
            setattr(insurance, field, value)
    else:
        insurance = InsuranceInfo(patient_id=patient.id, **data)
        db.add(insurance)

    db.commit()
    return {"success": True}


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(
    patient_id: str,
    current_user: User = Depends(require_roles(Role.DOCTOR, Role.ADMIN)),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient