from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password
from app.models.models import (
    User, Role, Patient, Doctor, Appointment, Prescription, MedicalRecord,
    EmergencyContact, InsuranceInfo, Review, Message
)
from app.schemas.user import UserOut, UserUpdate, ChangePasswordRequest
from app.core.deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_my_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_my_user(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/change-password", status_code=status.HTTP_200_OK)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"success": True, "message": "Password updated successfully"}


@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_my_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Several tables have required (NOT NULL) foreign keys to patients/doctors
    # without DB-level cascade delete configured, so we must manually delete
    # dependent rows in the correct order before removing the user.
    # Bulk .delete() bypasses ORM relationship management entirely, avoiding
    # SQLAlchemy's default behavior of nulling out FKs on the parent's delete.

    if current_user.role == Role.PATIENT:
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if patient:
            db.query(Review).filter(Review.patient_id == patient.id).delete()
            db.query(Prescription).filter(Prescription.patient_id == patient.id).delete()
            db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient.id).delete()
            db.query(Appointment).filter(Appointment.patient_id == patient.id).delete()
            db.query(EmergencyContact).filter(EmergencyContact.patient_id == patient.id).delete()
            db.query(InsuranceInfo).filter(InsuranceInfo.patient_id == patient.id).delete()
            db.delete(patient)

    elif current_user.role == Role.DOCTOR:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if doctor:
            db.query(Review).filter(Review.doctor_id == doctor.id).delete()
            db.query(Prescription).filter(Prescription.doctor_id == doctor.id).delete()
            db.query(Appointment).filter(Appointment.doctor_id == doctor.id).delete()
            # Qualification, AvailabilitySlot, BlockedDate already have
            # ondelete="CASCADE" at the DB level tied to doctors.id
            db.delete(doctor)

    # Messages have required FKs to users with no cascade configured
    db.query(Message).filter(
        (Message.sender_id == current_user.id) | (Message.receiver_id == current_user.id)
    ).delete()

    db.commit()

    # RefreshToken and Notification both have ondelete="CASCADE" on user_id,
    # so deleting the User row cleanly removes those automatically.
    db.delete(current_user)
    db.commit()

    return {"success": True, "message": "Account deleted successfully"}