from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

# TODO: Replace create_all with Alembic migrations before production.
# TODO: PostgreSQL — set DATABASE_URL to postgresql+psycopg2://... when approved.


class Base(DeclarativeBase):
    pass


def _engine_connect_args(database_url: str) -> dict:
    if database_url.startswith("sqlite"):
        return {"check_same_thread": False}
    return {}


engine = create_engine(
    settings.database_url,
    connect_args=_engine_connect_args(settings.database_url),
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app.crud.office_settings import seed_office_settings_if_missing
    from app.crud.user import seed_dev_admin_if_missing
    from app.models.client import Client  # noqa: F401
    from app.models.document import Document  # noqa: F401
    from app.models.office_settings import OfficeSettings  # noqa: F401
    from app.models.payment import Payment  # noqa: F401
    from app.models.task import Task  # noqa: F401
    from app.models.user import User  # noqa: F401

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_office_settings_if_missing(db)
        seed_dev_admin_if_missing(db)
    finally:
        db.close()
