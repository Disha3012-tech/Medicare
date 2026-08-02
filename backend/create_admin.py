"""
One-time script to create an admin user for the Medicare app.

Run from the backend/ directory with your virtualenv/conda env active:

    python create_admin.py

This does NOT go through the public /api/auth/register endpoint (which
intentionally blocks self-registering as ADMIN) — it inserts directly using
your existing User model and password hashing, the same way your seed/dev
data would be created.
"""
import sys
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.models import User, Role


def main():
    email = input("Admin email: ").strip()
    password = input("Admin password (min 8 chars): ").strip()
    first_name = input("First name: ").strip() or "Admin"
    last_name = input("Last name: ").strip() or "User"

    if len(password) < 8:
        print("Password must be at least 8 characters.")
        sys.exit(1)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"A user with email {email} already exists (role={existing.role}).")
            sys.exit(1)

        admin = User(
            email=email,
            password_hash=hash_password(password),
            role=Role.ADMIN,
            first_name=first_name,
            last_name=last_name,
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        db.commit()
        print(f"Admin user created: {email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()