from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.crud.client import get_client
from app.crud.task import count_open_tasks_for_client
from app.models.document import DOCUMENT_STATUSES, Document
from app.schemas.client_summary import ClientSummaryResponse, DocumentsByStatus

ZERO_MONEY = Decimal("0.00")


def get_client_summary(db: Session, client_id: int) -> ClientSummaryResponse | None:
    client = get_client(db, client_id)
    if client is None:
        return None

    document_count = (
        db.query(func.count(Document.id)).filter(Document.client_id == client_id).scalar()
        or 0
    )

    status_counts = {status: 0 for status in DOCUMENT_STATUSES}
    grouped = (
        db.query(Document.status, func.count(Document.id))
        .filter(Document.client_id == client_id)
        .group_by(Document.status)
        .all()
    )
    for status, count in grouped:
        if status in status_counts:
            status_counts[status] = count

    totals = (
        db.query(
            func.coalesce(func.sum(Document.amount_before_vat), 0),
            func.coalesce(func.sum(Document.vat_amount), 0),
            func.coalesce(func.sum(Document.total_amount), 0),
        )
        .filter(Document.client_id == client_id)
        .one()
    )

    total_before_vat = Decimal(str(totals[0])).quantize(Decimal("0.01"))
    vat_total = Decimal(str(totals[1])).quantize(Decimal("0.01"))
    total_including_vat = Decimal(str(totals[2])).quantize(Decimal("0.01"))

    open_task_count = count_open_tasks_for_client(db, client_id)

    return ClientSummaryResponse(
        client_id=client.id,
        document_count=document_count,
        documents_by_status=DocumentsByStatus(**status_counts),
        total_before_vat=total_before_vat,
        vat_total=vat_total,
        total_including_vat=total_including_vat,
        open_task_count=open_task_count,
        payment_record_count=0,
    )
