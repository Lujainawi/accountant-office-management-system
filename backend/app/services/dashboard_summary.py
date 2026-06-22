from datetime import date
from decimal import Decimal

from sqlalchemy import and_, case, func
from sqlalchemy.orm import Session

from app.crud.office_settings import get_office_settings
from app.models.client import Client
from app.models.document import DOCUMENT_STATUSES, Document
from app.models.task import Task
from app.schemas.client_summary import DocumentsByStatus
from app.schemas.dashboard import (
    DashboardCurrentMonth,
    DashboardMissingInfoDocumentItem,
    DashboardNeedsAttention,
    DashboardSummaryResponse,
    DashboardUrgentTaskItem,
)
from app.schemas.task import compute_is_overdue

NEEDS_ATTENTION_LIMIT = 5
ZERO_MONEY = Decimal("0.00")


def _resolve_today(today: date | None) -> date:
    return today if today is not None else date.today()


def _month_bounds(today: date) -> tuple[date, date]:
    month_start = today.replace(day=1)
    if today.month == 12:
        next_month_start = date(today.year + 1, 1, 1)
    else:
        next_month_start = date(today.year, today.month + 1, 1)
    return month_start, next_month_start


def _quantize_money(value) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"))


def _count_documents_by_status(db: Session) -> DocumentsByStatus:
    status_counts = {status: 0 for status in DOCUMENT_STATUSES}
    grouped = db.query(Document.status, func.count(Document.id)).group_by(Document.status).all()
    for status, count in grouped:
        if status in status_counts:
            status_counts[status] = count
    return DocumentsByStatus(**status_counts)


def _current_month_totals(db: Session, month_start: date, next_month_start: date) -> tuple[Decimal, Decimal, Decimal]:
    totals = (
        db.query(
            func.coalesce(func.sum(Document.amount_before_vat), 0),
            func.coalesce(func.sum(Document.vat_amount), 0),
            func.coalesce(func.sum(Document.total_amount), 0),
        )
        .filter(
            Document.document_date >= month_start,
            Document.document_date < next_month_start,
        )
        .one()
    )
    return (
        _quantize_money(totals[0]),
        _quantize_money(totals[1]),
        _quantize_money(totals[2]),
    )


def _fetch_urgent_tasks(db: Session, today: date) -> list[DashboardUrgentTaskItem]:
    overdue_first = case(
        (and_(Task.due_date.isnot(None), Task.due_date < today), 0),
        else_=1,
    )
    has_due_date_first = case((Task.due_date.is_(None), 1), else_=0)

    rows = (
        db.query(Task, Client.client_name)
        .join(Client, Client.id == Task.client_id)
        .filter(
            Task.priority == "urgent",
            Task.status.in_(("open", "in_progress")),
        )
        .order_by(
            overdue_first.asc(),
            has_due_date_first.asc(),
            Task.due_date.asc(),
            Task.updated_at.desc(),
            Task.id.desc(),
        )
        .limit(NEEDS_ATTENTION_LIMIT)
        .all()
    )

    return [
        DashboardUrgentTaskItem(
            id=task.id,
            title=task.title,
            client_id=task.client_id,
            client_name=client_name,
            due_date=task.due_date,
            status=task.status,
            priority=task.priority,
            is_overdue=compute_is_overdue(task.due_date, task.status, today=today),
        )
        for task, client_name in rows
    ]


def _fetch_missing_information_documents(
    db: Session,
) -> list[DashboardMissingInfoDocumentItem]:
    rows = (
        db.query(Document, Client.client_name)
        .join(Client, Client.id == Document.client_id)
        .filter(Document.status == "missing_information")
        .order_by(
            Document.document_date.desc(),
            Document.updated_at.desc(),
            Document.id.desc(),
        )
        .limit(NEEDS_ATTENTION_LIMIT)
        .all()
    )

    return [
        DashboardMissingInfoDocumentItem(
            id=document.id,
            document_name=document.document_name,
            client_id=document.client_id,
            client_name=client_name,
            document_date=document.document_date,
            status=document.status,
        )
        for document, client_name in rows
    ]


def get_dashboard_summary(
    db: Session,
    today: date | None = None,
) -> DashboardSummaryResponse:
    resolved_today = _resolve_today(today)
    month_start, next_month_start = _month_bounds(resolved_today)
    settings_row = get_office_settings(db)

    total_clients = db.query(func.count(Client.id)).scalar() or 0
    active_clients = (
        db.query(func.count(Client.id)).filter(Client.status == "active").scalar() or 0
    )
    total_documents = db.query(func.count(Document.id)).scalar() or 0
    documents_by_status = _count_documents_by_status(db)

    open_task_count = (
        db.query(func.count(Task.id))
        .filter(Task.status.in_(("open", "in_progress")))
        .scalar()
        or 0
    )
    urgent_task_count = (
        db.query(func.count(Task.id))
        .filter(
            Task.priority == "urgent",
            Task.status != "done",
        )
        .scalar()
        or 0
    )

    (
        current_month_total_before_vat,
        current_month_vat_total,
        current_month_total_including_vat,
    ) = _current_month_totals(db, month_start, next_month_start)

    needs_attention = DashboardNeedsAttention(
        urgent_tasks=_fetch_urgent_tasks(db, resolved_today),
        missing_information_documents=_fetch_missing_information_documents(db),
    )

    return DashboardSummaryResponse(
        office_name=settings_row.office_name,
        default_currency=settings_row.default_currency,
        current_month=DashboardCurrentMonth(
            year=resolved_today.year,
            month=resolved_today.month,
        ),
        total_clients=total_clients,
        active_clients=active_clients,
        total_documents=total_documents,
        documents_by_status=documents_by_status,
        open_task_count=open_task_count,
        urgent_task_count=urgent_task_count,
        current_month_total_before_vat=current_month_total_before_vat,
        current_month_vat_total=current_month_vat_total,
        current_month_total_including_vat=current_month_total_including_vat,
        needs_attention=needs_attention,
    )
