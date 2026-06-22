from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.integration_status import IntegrationStatus

CANONICAL_INTEGRATION_SEEDS: tuple[dict[str, str | bool], ...] = (
    {
        "service_name": "email",
        "status": "mock_mode",
        "mode": "mock",
        "configured": False,
        "notes": "תצוגה מקדימה בלבד — ללא שליחה",
    },
    {
        "service_name": "ocr",
        "status": "coming_soon",
        "mode": "mock",
        "configured": False,
        "notes": "חילוץ לדוגמה בלבד",
    },
    {
        "service_name": "tax_authority",
        "status": "planned",
        "mode": "mock",
        "configured": False,
        "notes": "ללא חיבור לרשות המסים",
    },
    {
        "service_name": "digital_signature",
        "status": "planned",
        "mode": "mock",
        "configured": False,
        "notes": "סטטוסי חתימה לדוגמה",
    },
    {
        "service_name": "online_payments",
        "status": "mock_mode",
        "mode": "mock",
        "configured": False,
        "notes": "ללא סליקה — רישום ידני פעיל",
    },
    {
        "service_name": "ai_assistant",
        "status": "planned",
        "mode": "mock",
        "configured": False,
        "notes": "הצעות לדוגמה בלבד",
    },
)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def seed_integration_statuses_if_missing(db: Session) -> None:
    now = _utc_now()
    created_any = False

    for seed in CANONICAL_INTEGRATION_SEEDS:
        service_name = str(seed["service_name"])
        existing = (
            db.query(IntegrationStatus)
            .filter(IntegrationStatus.service_name == service_name)
            .first()
        )
        if existing is not None:
            continue

        db.add(
            IntegrationStatus(
                service_name=service_name,
                status=str(seed["status"]),
                mode=str(seed["mode"]),
                configured=bool(seed["configured"]),
                notes=str(seed["notes"]) if seed["notes"] is not None else None,
                created_at=now,
                updated_at=now,
            )
        )
        created_any = True

    if created_any:
        db.commit()


def list_integration_statuses(db: Session) -> list[IntegrationStatus]:
    return (
        db.query(IntegrationStatus)
        .order_by(IntegrationStatus.id.asc())
        .all()
    )


def get_integration_status_by_service(
    db: Session, service_name: str
) -> IntegrationStatus | None:
    return (
        db.query(IntegrationStatus)
        .filter(IntegrationStatus.service_name == service_name)
        .first()
    )
