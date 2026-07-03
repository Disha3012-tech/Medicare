import os
import shutil
from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.models import MedicalRecord, Patient, Doctor, User, Role, RecordType
from app.schemas.record import MedicalRecordOut
from app.core.deps import require_roles, get_current_user

router = APIRouter(prefix="/records", tags=["medical-records"])

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}


@router.post("", response_model=MedicalRecordOut, status_code=status.HTTP_201_CREATED)
async def upload_record(
    title: str = Form(...),
    type: RecordType = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(Role.PATIENT)),
    db: Session = Depends(get_db),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()

    os.makedirs(settings.upload_dir, exist_ok=True)
    stored_name = f"{uuid4()}{ext}"
    dest_path = os.path.join(settings.upload_dir, stored_name)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    size_kb = os.path.getsize(dest_path) // 1024

    record = MedicalRecord(
        patient_id=patient.id,
        title=title,
        type=type,
        file_url=f"/{settings.upload_dir}/{stored_name}",
        file_name=file.filename,
        file_size_kb=size_kb,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/mine", response_model=List[MedicalRecordOut])
def list_my_records(
    current_user: User = Depends(require_roles(Role.PATIENT)),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    return db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient.id).order_by(
        MedicalRecord.uploaded_at.desc()
    ).all()


@router.get("/patient/{patient_id}", response_model=List[MedicalRecordOut])
def list_patient_records(
    patient_id: str,
    current_user: User = Depends(require_roles(Role.DOCTOR, Role.ADMIN)),
    db: Session = Depends(get_db),
):
    return db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient_id).order_by(
        MedicalRecord.uploaded_at.desc()
    ).all()


@router.delete("/{record_id}", status_code=status.HTTP_200_OK)
def delete_record(
    record_id: str,
    current_user: User = Depends(require_roles(Role.PATIENT)),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record or record.patient_id != patient.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    file_path = record.file_url.lstrip("/")
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(record)
    db.commit()
    return {"success": True}