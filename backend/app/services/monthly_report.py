from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.client import Client
from app.models.document import DOCUMENT_STATUSES, Document
from app.schemas.client_summary import DocumentsByStatus
from app.schemas.monthly_report import (
    MonthlyReportClientRow,
    MonthlyReportPeriod,
    MonthlyReportResponse,
    MonthlyReportSummary,
)

ZERO_MONEY = Decimal("0.00")


def _month_bounds(year: int, month: int) -> tuple[date, date]:
    month_start = date(year, month, 1)
    if month == 12:
        next_month_start = date(year + 1, 1, 1)
    else:
        next_month_start = date(year, month + 1, 1)
    return month_start, next_month_start


def _quantize_money(value) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"))


def _documents_in_period_filter(month_start: date, next_month_start: date):
    return (
        Document.document_date >= month_start,
        Document.document_date < next_month_start,
    )


def _count_documents_by_status(db: Session, month_start: date, next_month_start: date) -> DocumentsByStatus:
    status_counts = {status: 0 for status in DOCUMENT_STATUSES}
    period_filter = _documents_in_period_filter(month_start, next_month_start)
    grouped = (
        db.query(Document.status, func.count(Document.id))
        .filter(*period_filter)
        .group_by(Document.status)
        .all()
    )
    for status, count in grouped:
        if status in status_counts:
            status_counts[status] = count
    return DocumentsByStatus(**status_counts)


def _period_summary(db: Session, month_start: date, next_month_start: date) -> MonthlyReportSummary:
    period_filter = _documents_in_period_filter(month_start, next_month_start)

    document_count = (
        db.query(func.count(Document.id)).filter(*period_filter).scalar() or 0
    )
    clients_handled = (
        db.query(func.count(func.distinct(Document.client_id)))
        .filter(*period_filter)
        .scalar()
        or 0
    )

    totals = (
        db.query(
            func.coalesce(func.sum(Document.amount_before_vat), 0),
            func.coalesce(func.sum(Document.vat_amount), 0),
            func.coalesce(func.sum(Document.total_amount), 0),
        )
        .filter(*period_filter)
        .one()
    )

    return MonthlyReportSummary(
        clients_handled=clients_handled,
        document_count=document_count,
        total_before_vat=_quantize_money(totals[0]),
        vat_total=_quantize_money(totals[1]),
        total_including_vat=_quantize_money(totals[2]),
    )


def _client_breakdown(
    db: Session, month_start: date, next_month_start: date
) -> list[MonthlyReportClientRow]:
    period_filter = _documents_in_period_filter(month_start, next_month_start)
    rows = (
        db.query(
            Document.client_id,
            Client.client_name,
            func.count(Document.id),
            func.coalesce(func.sum(Document.amount_before_vat), 0),
            func.coalesce(func.sum(Document.vat_amount), 0),
            func.coalesce(func.sum(Document.total_amount), 0),
        )
        .join(Client, Client.id == Document.client_id)
        .filter(*period_filter)
        .group_by(Document.client_id, Client.client_name)
        .order_by(
            func.sum(Document.total_amount).desc(),
            Client.client_name.asc(),
        )
        .all()
    )

    return [
        MonthlyReportClientRow(
            client_id=client_id,
            client_name=client_name,
            document_count=document_count,
            total_before_vat=_quantize_money(total_before_vat),
            vat_total=_quantize_money(vat_total),
            total_including_vat=_quantize_money(total_including_vat),
        )
        for client_id, client_name, document_count, total_before_vat, vat_total, total_including_vat in rows
    ]


def get_monthly_report(db: Session, *, year: int, month: int) -> MonthlyReportResponse:
    month_start, next_month_start = _month_bounds(year, month)

    return MonthlyReportResponse(
        period=MonthlyReportPeriod(year=year, month=month),
        summary=_period_summary(db, month_start, next_month_start),
        documents_by_status=_count_documents_by_status(db, month_start, next_month_start),
        clients=_client_breakdown(db, month_start, next_month_start),
    )
