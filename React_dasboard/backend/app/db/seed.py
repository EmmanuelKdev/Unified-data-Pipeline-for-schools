import os
from app.core.security import get_password_hash
from app.db.database import SessionLocal
from app.models.schema import User

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@school.local")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
ADMIN_NAME = os.getenv("ADMIN_NAME", "Admin User")


def seed_admin_user() -> None:
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == ADMIN_EMAIL).first():
            return
        db.add(
            User(
                email=ADMIN_EMAIL,
                full_name=ADMIN_NAME,
                hashed_password=get_password_hash(ADMIN_PASSWORD),
                role="admin",
                is_active=True,
            )
        )
        db.commit()
        print(f"Seeded admin user: {ADMIN_EMAIL}")
    finally:
        db.close()
