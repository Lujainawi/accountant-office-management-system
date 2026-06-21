import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.config import PLACEHOLDER_DEV_ADMIN_PASSWORD, settings
from app.models.user import User
from app.utils.security import hash_password

logger = logging.getLogger(__name__)

DEFAULT_ADMIN_NAME = "מנהל מערכת"


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def get_user_by_email(db: Session, email: str) -> User | None:
    normalized_email = email.strip().lower()
    return db.query(User).filter(User.email == normalized_email).first()


def seed_dev_admin_if_missing(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    password = settings.dev_admin_password
    if not password.strip() or password == PLACEHOLDER_DEV_ADMIN_PASSWORD:
        logger.warning(
            "DEV_ADMIN_PASSWORD is missing or still a placeholder. "
            "No development admin user was created."
        )
        return

    now = _utc_now()
    admin_user = User(
        name=DEFAULT_ADMIN_NAME,
        email=settings.dev_admin_email.strip().lower(),
        password_hash=hash_password(password),
        role="admin",
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    db.add(admin_user)
    db.commit()
