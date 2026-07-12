from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.models import (
    Doctor, User, Role, Qualification, AvailabilitySlot,
    Patient, Appointment, AppointmentStatus, Prescription
)
from app.schemas.doctor import (
    DoctorOut, DoctorUpdate, QualificationIn, AvailabilitySlotIn, AvailabilitySlotOut
)
from app.schemas.patient import PatientSummaryOut
from app.core.deps import get_current_user, require_roles
from datetime import datetime as dt
from app.schemas.doctor import BlockedDateIn, BlockedDateOut, VacationModeIn
from app.models.models import BlockedDate
router = APIRouter(prefix="/doctors", tags=["doctors"])


def _serialize_doctor(doctor: Doctor) -> DoctorOut:
    return DoctorOut(
        id=doctor.id,
        user_id=doctor.user_id,
        specialty=doctor.specialty,
        license_number=doctor.license_number,
        years_experience=doctor.years_experience,
        bio=doctor.bio,
        consultation_fee=float(doctor.consultation_fee),
        clinic_name=doctor.clinic_name,
        clinic_address=doctor.clinic_address,
        clinic_city=doctor.clinic_city,
        clinic_state=doctor.clinic_state,
        is_verified=doctor.is_verified,
        average_rating=doctor.average_rating,
        total_reviews=doctor.total_reviews,
        first_name=doctor.user.first_name,
        last_name=doctor.user.last_name,
        avatar_url=doctor.user.avatar_url,
        is_on_vacation=doctor.is_on_vacation,
        slot_capacity=doctor.slot_capacity,
    )
from app.schemas.doctor import QualificationOut

from typing import Dict
from datetime import datetime, timedelta

@router.get("/{doctor_id}/slot-bookings", response_model=Dict[str, int])
def get_slot_bookings(doctor_id: str, date: str, db: Session = Depends(get_db)):
    """Returns { 'HH:MM': count } of active bookings per exact time, for a given date."""
    day_start = datetime.strptime(date, "%Y-%m-%d")
    day_end = day_start + timedelta(days=1)
    appts = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
        Appointment.scheduled_at >= day_start,
        Appointment.scheduled_at < day_end,
    ).all()
    counts: Dict[str, int] = {}
    for a in appts:
        key = a.scheduled_at.strftime("%H:%M")
        counts[key] = counts.get(key, 0) + 2
    return counts
@router.get("/me/qualifications", response_model=List[QualificationOut])
def list_my_qualifications(
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")
    return db.query(Qualification).filter(Qualification.doctor_id == doctor.id).all()


@router.delete("/me/qualifications/{qualification_id}", status_code=status.HTTP_200_OK)
def delete_qualification(
    qualification_id: str,
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    qual = db.query(Qualification).filter(Qualification.id == qualification_id, Qualification.doctor_id == doctor.id).first()
    if not qual:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Qualification not found")
    db.delete(qual)
    db.commit()
    return {"success": True}

@router.get("/{doctor_id}/blocked-dates", response_model=List[BlockedDateOut])
def get_blocked_dates(doctor_id: str, db: Session = Depends(get_db)):
    return db.query(BlockedDate).filter(BlockedDate.doctor_id == doctor_id).all()


@router.put("/me/blocked-dates", response_model=List[BlockedDateOut])
def set_my_blocked_dates(
    dates: List[BlockedDateIn],
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")

    db.query(BlockedDate).filter(BlockedDate.doctor_id == doctor.id).delete()
    new_rows = [
        BlockedDate(doctor_id=doctor.id, date=dt.strptime(d.date, "%Y-%m-%d"), reason=d.reason)
        for d in dates
    ]
    db.add_all(new_rows)
    db.commit()

    return db.query(BlockedDate).filter(BlockedDate.doctor_id == doctor.id).all()


@router.put("/me/vacation-mode", response_model=DoctorOut)
def set_vacation_mode(
    payload: VacationModeIn,
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).options(joinedload(Doctor.user)).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")
    doctor.is_on_vacation = payload.is_on_vacation
    db.commit()
    db.refresh(doctor)
    return _serialize_doctor(doctor)
@router.get("", response_model=List[DoctorOut])
def list_doctors(
    specialty: Optional[str] = None,
    city: Optional[str] = None,
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Doctor).options(joinedload(Doctor.user)).join(User).filter(Doctor.is_verified.is_(True))
    if specialty:
        query = query.filter(Doctor.specialty.ilike(f"%{specialty}%"))
    if city:
        query = query.filter(Doctor.clinic_city.ilike(f"%{city}%"))
    if min_rating is not None:
        query = query.filter(Doctor.average_rating >= min_rating)
    if search:
        query = query.filter(
            (User.first_name.ilike(f"%{search}%")) | (User.last_name.ilike(f"%{search}%"))
        )
    doctors = query.all()
    return [_serialize_doctor(d) for d in doctors]


@router.get("/me", response_model=DoctorOut)
def get_my_profile(
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).options(joinedload(Doctor.user)).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")
    return _serialize_doctor(doctor)


@router.get("/me/patients", response_model=List[PatientSummaryOut])
def list_my_patients(
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")

    patient_ids = [
        pid for (pid,) in
        db.query(Appointment.patient_id).filter(Appointment.doctor_id == doctor.id).distinct().all()
    ]

    now = datetime.now(timezone.utc)
    summaries: List[PatientSummaryOut] = []

    for pid in patient_ids:
        patient = db.query(Patient).options(joinedload(Patient.user)).filter(Patient.id == pid).first()
        if not patient or not patient.user:
            continue

        appts = db.query(Appointment).filter(
            Appointment.doctor_id == doctor.id, Appointment.patient_id == pid
        ).order_by(Appointment.scheduled_at.desc()).all()

        past_appts = [a for a in appts if a.scheduled_at <= now]
        future_appts = [
            a for a in appts
            if a.scheduled_at > now and a.status in (AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)
        ]
        last_visit = past_appts[0].scheduled_at if past_appts else None
        next_visit = min((a.scheduled_at for a in future_appts), default=None)

        latest_prescription = db.query(Prescription).filter(
            Prescription.doctor_id == doctor.id, Prescription.patient_id == pid
        ).order_by(Prescription.issued_at.desc()).first()
        medications = [m.name for m in latest_prescription.medicines] if latest_prescription else []

        age = None
        if patient.date_of_birth:
            age = (now.date() - patient.date_of_birth.date()).days // 365

        summaries.append(PatientSummaryOut(
            id=patient.id,
            user_id=patient.user_id,
            name=f"{patient.user.first_name} {patient.user.last_name}",
            age=age,
            gender=patient.gender.value if patient.gender else None,
            blood_group=patient.blood_group,
            phone=patient.user.phone,
            email=patient.user.email,
            chronic_conditions=patient.chronic_conditions or [],
            allergies=patient.allergies or [],
            last_visit=last_visit,
            next_visit=next_visit,
            visit_count=len(appts),
            current_medications=medications,
            avatar_url=patient.user.avatar_url,
        ))

    return summaries


@router.get("/{doctor_id}", response_model=DoctorOut)
def get_doctor(doctor_id: str, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).options(joinedload(Doctor.user)).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return _serialize_doctor(doctor)


@router.patch("/me", response_model=DoctorOut)
def update_my_profile(
    payload: DoctorUpdate,
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).options(joinedload(Doctor.user)).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(doctor, field, value)

    db.commit()
    db.refresh(doctor)
    return _serialize_doctor(doctor)


@router.post("/me/qualifications", status_code=status.HTTP_201_CREATED)
def add_qualification(
    payload: QualificationIn,
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")

    qualification = Qualification(doctor_id=doctor.id, **payload.model_dump())
    db.add(qualification)
    db.commit()
    return {"success": True, "id": qualification.id}


@router.get("/{doctor_id}/availability", response_model=List[AvailabilitySlotOut])
def get_availability(doctor_id: str, db: Session = Depends(get_db)):
    return db.query(AvailabilitySlot).filter(
        AvailabilitySlot.doctor_id == doctor_id, AvailabilitySlot.is_active.is_(True)
    ).all()


@router.put("/me/availability", response_model=List[AvailabilitySlotOut])
def set_my_availability(
    slots: List[AvailabilitySlotIn],
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")

    db.query(AvailabilitySlot).filter(AvailabilitySlot.doctor_id == doctor.id).delete()
    new_slots = [AvailabilitySlot(doctor_id=doctor.id, **slot.model_dump()) for slot in slots]
    db.add_all(new_slots)
    db.commit()

    return db.query(AvailabilitySlot).filter(AvailabilitySlot.doctor_id == doctor.id).all()