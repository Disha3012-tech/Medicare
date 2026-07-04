import enum
import uuid

from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey, Integer, Float,
    Text, Enum as SAEnum, Numeric, JSON, ARRAY, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


# ---------- ENUMS ----------

class Role(str, enum.Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"


class Gender(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"


class AppointmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"


class AppointmentType(str, enum.Enum):
    IN_PERSON = "IN_PERSON"
    VIDEO = "VIDEO"


class NotificationType(str, enum.Enum):
    APPOINTMENT = "APPOINTMENT"
    MESSAGE = "MESSAGE"
    PRESCRIPTION = "PRESCRIPTION"
    SYSTEM = "SYSTEM"
    REMINDER = "REMINDER"


class RecordType(str, enum.Enum):
    LAB_REPORT = "LAB_REPORT"
    IMAGING = "IMAGING"
    PRESCRIPTION = "PRESCRIPTION"
    DISCHARGE_SUMMARY = "DISCHARGE_SUMMARY"
    VACCINATION = "VACCINATION"
    OTHER = "OTHER"


# ---------- CORE ----------

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SAEnum(Role), nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient_profile = relationship("Patient", back_populates="user", uselist=False, cascade="all, delete")
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False, cascade="all, delete")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    token = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    revoked = Column(Boolean, default=False)

    user = relationship("User", back_populates="refresh_tokens")


# ---------- PATIENT ----------

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    date_of_birth = Column(DateTime, nullable=True)
    gender = Column(SAEnum(Gender), nullable=True)
    blood_group = Column(String, nullable=True)
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    zip_code = Column(String, nullable=True)
    allergies = Column(ARRAY(String), default=list)
    chronic_conditions = Column(ARRAY(String), default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="patient_profile")
    emergency_contact = relationship("EmergencyContact", back_populates="patient", uselist=False, cascade="all, delete")
    insurance = relationship("InsuranceInfo", back_populates="patient", uselist=False, cascade="all, delete")
    appointments = relationship("Appointment", back_populates="patient")
    records = relationship("MedicalRecord", back_populates="patient", cascade="all, delete")
    prescriptions = relationship("Prescription", back_populates="patient")
    reviews = relationship("Review", back_populates="patient")


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("patients.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String, nullable=False)
    relationship_ = Column("relationship", String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="emergency_contact")


class InsuranceInfo(Base):
    __tablename__ = "insurance_info"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("patients.id", ondelete="CASCADE"), unique=True, nullable=False)
    provider = Column(String, nullable=False)
    policy_number = Column(String, nullable=False)
    group_number = Column(String, nullable=True)
    valid_until = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="insurance")


# ---------- DOCTOR ----------

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    specialty = Column(String, nullable=False, index=True)
    license_number = Column(String, unique=True, nullable=False)
    years_experience = Column(Integer, default=0)
    bio = Column(Text, nullable=True)
    consultation_fee = Column(Numeric(10, 2), default=0)
    clinic_name = Column(String, nullable=True)
    clinic_address = Column(String, nullable=True)
    clinic_city = Column(String, nullable=True)
    clinic_state = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    average_rating = Column(Float, default=0)
    total_reviews = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_on_vacation = Column(Boolean, default=False)
    user = relationship("User", back_populates="doctor_profile")
    qualifications = relationship("Qualification", back_populates="doctor", cascade="all, delete")
    availability = relationship("AvailabilitySlot", back_populates="doctor", cascade="all, delete")
    appointments = relationship("Appointment", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")
    reviews = relationship("Review", back_populates="doctor")
    blocked_dates = relationship("BlockedDate", back_populates=None, cascade="all, delete")


class Qualification(Base):
    __tablename__ = "qualifications"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    degree = Column(String, nullable=False)
    institution = Column(String, nullable=False)
    year = Column(Integer, nullable=False)

    doctor = relationship("Doctor", back_populates="qualifications")

class BlockedDate(Base):
    __tablename__ = "blocked_dates"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(DateTime, nullable=False)  # stored as date-only (midnight)
    reason = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    doctor = relationship("Doctor")
class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0=Sunday ... 6=Saturday
    start_time = Column(String, nullable=False)  # "09:00"
    end_time = Column(String, nullable=False)  # "17:00"
    slot_minutes = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)

    doctor = relationship("Doctor", back_populates="availability")


# ---------- APPOINTMENTS ----------

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id"), nullable=False, index=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    duration_min = Column(Integer, default=30)
    type = Column(SAEnum(AppointmentType), default=AppointmentType.IN_PERSON)
    status = Column(SAEnum(AppointmentStatus), default=AppointmentStatus.PENDING)
    reason_for_visit = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    cancel_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    video_session = relationship("VideoSession", back_populates="appointment", uselist=False, cascade="all, delete")
    prescription = relationship("Prescription", back_populates="appointment", uselist=False)
    review = relationship("Review", back_populates="appointment", uselist=False)


class VideoSession(Base):
    __tablename__ = "video_sessions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    appointment_id = Column(UUID(as_uuid=False), ForeignKey("appointments.id", ondelete="CASCADE"), unique=True, nullable=False)
    room_id = Column(String, unique=True, default=gen_uuid)
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)

    appointment = relationship("Appointment", back_populates="video_session")


# ---------- PRESCRIPTIONS ----------

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    appointment_id = Column(UUID(as_uuid=False), ForeignKey("appointments.id"), unique=True, nullable=True)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id"), nullable=False, index=True)
    diagnosis = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())

    appointment = relationship("Appointment", back_populates="prescription")
    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("Doctor", back_populates="prescriptions")
    medicines = relationship("PrescriptionMedicine", back_populates="prescription", cascade="all, delete")


class PrescriptionMedicine(Base):
    __tablename__ = "prescription_medicines"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    prescription_id = Column(UUID(as_uuid=False), ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    instructions = Column(Text, nullable=True)

    prescription = relationship("Prescription", back_populates="medicines")


# ---------- MEDICAL RECORDS ----------

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("patients.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    type = Column(SAEnum(RecordType), nullable=False)
    file_url = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_size_kb = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="records")


# ---------- MESSAGING ----------

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    sender_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    receiver_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ---------- NOTIFICATIONS ----------

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(SAEnum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


# ---------- REVIEWS ----------

class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    appointment_id = Column(UUID(as_uuid=False), ForeignKey("appointments.id"), unique=True, nullable=False)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    appointment = relationship("Appointment", back_populates="review")
    patient = relationship("Patient", back_populates="reviews")
    doctor = relationship("Doctor", back_populates="reviews")