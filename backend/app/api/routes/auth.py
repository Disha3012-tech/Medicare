from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token, create_refresh_token, decode_token
)
from app.core.config import settings
from app.models.models import User, Patient, Doctor, RefreshToken, Role
from app.schemas.auth import RegisterRequest, LoginRequest, RefreshRequest, TokenResponse, UserOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_tokens(db: Session, user: User) -> dict:
    access_token = create_access_token(user.id, user.role.value)
    refresh_token = create_refresh_token(user.id)

    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    db.add(RefreshToken(token=refresh_token, user_id=user.id, expires_at=expires_at))
    db.commit()

    return {"access_token": access_token, "refresh_token": refresh_token}


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")

    if payload.role == Role.ADMIN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot self-register as admin")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        role=payload.role,
        phone=payload.phone,
    )
    db.add(user)
    db.flush()  # get user.id before creating profile

    if payload.role == Role.PATIENT:
        db.add(Patient(user_id=user.id))
    elif payload.role == Role.DOCTOR:
        db.add(Doctor(
            user_id=user.id,
            specialty="General Physician",
            license_number=f"PENDING-{user.id[:8]}",
            consultation_fee=0,
        ))

    db.commit()
    db.refresh(user)

    tokens = _issue_tokens(db, user)
    return {"user": UserOut.model_validate(user), **tokens}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    tokens = _issue_tokens(db, user)
    return {"user": UserOut.model_validate(user), **tokens}


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    token_payload = decode_token(payload.refresh_token)
    if not token_payload or token_payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    stored = db.query(RefreshToken).filter(RefreshToken.token == payload.refresh_token).first()
    if not stored or stored.revoked or stored.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or revoked")

    user = db.query(User).filter(User.id == token_payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    stored.revoked = True  # rotate
    db.commit()

    tokens = _issue_tokens(db, user)
    return {"user": UserOut.model_validate(user), **tokens}


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(payload: RefreshRequest, db: Session = Depends(get_db)):
    db.query(RefreshToken).filter(RefreshToken.token == payload.refresh_token).update({"revoked": True})
    db.commit()
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user