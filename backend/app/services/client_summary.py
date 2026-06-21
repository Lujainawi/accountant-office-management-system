from decimal import Decimal

from sqlalchemy.orm import Session

from app.crud.client import get_client
from app.schemas.client_summary import ClientSummaryResponse, DocumentsByStatus


def get_client_summary(db: Session, client_id: int) -> ClientSummaryResponse | None:
    client = get_client(db, client_id)
    if client is None:
        return None

    # Phase 8+ will aggregate from Document, Task, and Payment tables.
    return ClientSummaryResponse(
        client_id=client.id,
        document_count=0,
        documents_by_status=DocumentsByStatus(),
        total_before_vat=Decimal("0.00"),
        vat_total=Decimal("0.00"),
        total_including_vat=Decimal("0.00"),
        open_task_count=0,
        payment_record_count=0,
    )
