from datetime import datetime, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from app.config import BACKEND_DIR, settings
from app.crud.office_settings import seed_office_settings_if_missing
from app.database import Base, SessionLocal, engine, get_db
from app.main import app
from app.models.client import Client
from app.models.user import User
from app.utils.security import hash_password

TEST_PASSWORD = "test-password-123"
TEST_EMAIL = "tester@example.test"

DEV_SESSIONLOCAL_ERROR = "Tests must not use the development SessionLocal."
DEV_ENGINE_ERROR = "Tests must not use the development engine."


def resolve_configured_sqlite_path() -> Path | None:
    url = make_url(settings.database_url)
    if url.drivername != "sqlite":
        return None
    if not url.database or url.database == ":memory:":
        return None

    db_path = Path(url.database)
    if not db_path.is_absolute():
        db_path = (BACKEND_DIR / db_path).resolve()
    else:
        db_path = db_path.resolve()
    return db_path


@pytest.fixture(scope="session")
def configured_dev_db_path() -> Path | None:
    return resolve_configured_sqlite_path()


@pytest.fixture(scope="session")
def dev_db_guard(configured_dev_db_path: Path | None):
    if configured_dev_db_path is None:
        yield
        return

    existed_before = configured_dev_db_path.exists()
    mtime_before = (
        configured_dev_db_path.stat().st_mtime if existed_before else None
    )
    yield
    if existed_before:
        assert configured_dev_db_path.exists()
        assert configured_dev_db_path.stat().st_mtime == mtime_before
    else:
        assert not configured_dev_db_path.exists()


def _guard_dev_session_local():
    raise RuntimeError(DEV_SESSIONLOCAL_ERROR)


def _guard_dev_engine_connect(*args, **kwargs):
    raise RuntimeError(DEV_ENGINE_ERROR)


@pytest.fixture()
def test_app(tmp_path, monkeypatch, dev_db_guard):
    db_path = tmp_path / "test.db"
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()

    test_engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
    )
    TestSessionLocal = sessionmaker(
        bind=test_engine, autocommit=False, autoflush=False
    )

    from app.models.client import Client as ClientModel  # noqa: F401
    from app.models.document import Document as DocumentModel  # noqa: F401
    from app.models.office_settings import OfficeSettings as OfficeSettingsModel  # noqa: F401
    from app.models.user import User as UserModel  # noqa: F401

    Base.metadata.create_all(bind=test_engine)

    db = TestSessionLocal()
    try:
        seed_office_settings_if_missing(db)
        now = datetime.now(timezone.utc)
        user = User(
            name="בודק",
            email=TEST_EMAIL,
            password_hash=hash_password(TEST_PASSWORD),
            role="admin",
            is_active=True,
            created_at=now,
            updated_at=now,
        )
        db.add(user)
        client = Client(
            client_name="דנה כהן",
            business_name="סטודיו דנה",
            phone="050-555-0101",
            email="dana@example.test",
            business_id="DEMO-1001",
            client_type="authorized_dealer",
            address=None,
            status="active",
            notes=None,
            created_at=now,
            updated_at=now,
        )
        db.add(client)
        db.commit()
        db.refresh(user)
        db.refresh(client)
        seeded = {"user": user, "client": client}
    finally:
        db.close()

    original_upload_dir = settings.upload_dir
    monkeypatch.setattr(settings, "upload_dir", upload_dir)
    monkeypatch.setattr("app.database.SessionLocal", _guard_dev_session_local)
    monkeypatch.setattr(engine, "connect", _guard_dev_engine_connect)

    def override_get_db():
        db = TestSessionLocal()
        try:
            yield db
        finally:
            db.close()

    def noop_init_db():
        return None

    monkeypatch.setattr("app.main.init_db", noop_init_db)
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as client:
        yield {
            "client": client,
            "session_factory": TestSessionLocal,
            "upload_dir": upload_dir,
            "seeded": seeded,
            "configured_dev_db_path": resolve_configured_sqlite_path(),
        }

    app.dependency_overrides.pop(get_db, None)
    monkeypatch.setattr(settings, "upload_dir", original_upload_dir)
    test_engine.dispose()


@pytest.fixture()
def auth_client(test_app):
    api = test_app["client"]
    response = api.post(
        "/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
    )
    assert response.status_code == 200
    return api


def make_pdf_bytes(content: bytes = b"demo") -> bytes:
    return b"%PDF-1.4\n" + content


def make_png_bytes() -> bytes:
    return (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\nIDATx\x9cc``\x00\x00\x00\x02\x00\x01"
        b"\xe5\x27\xde\xfc\x00\x00\x00\x00IEND\xaeB`\x82"
    )


def upload_document(
    api: TestClient,
    *,
    client_id: int,
    filename: str = "demo.pdf",
    content: bytes | None = None,
    document_name: str = "מסמך דוגמה",
    document_type: str = "invoice",
    document_date: str = "2026-05-15",
    amount_before_vat: str = "1000.00",
    vat_rate: str | None = None,
    status: str = "new",
    notes: str = "",
):
    files = {"file": (filename, content or make_pdf_bytes(), "application/pdf")}
    data = {
        "client_id": str(client_id),
        "document_name": document_name,
        "document_type": document_type,
        "document_date": document_date,
        "amount_before_vat": amount_before_vat,
        "status": status,
        "notes": notes,
    }
    if vat_rate is not None:
        data["vat_rate"] = vat_rate
    return api.post("/api/documents", files=files, data=data)
