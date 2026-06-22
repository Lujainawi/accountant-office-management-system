from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

PAYMENT_STATUSES = (
    "unpaid",
    "paid",
    "partially_paid",
    "pending",
    "failed",
)

PAYMENT_METHODS = (
    "cash",
    "bank_transfer",
    "check",
    "bit",
    "standing_order",
    "other",
)


class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (
        Index("ix_payments_client_id", "client_id"),
        Index("ix_payments_document_id", "document_id"),
        Index("ix_payments_status", "status"),
        Index("ix_payments_payment_date", "payment_date"),
        Index("ix_payments_client_id_payment_date", "client_id", "payment_date"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    client_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("clients.id"), nullable=False
    )
    document_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("documents.id"), nullable=True
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    payment_method: Mapped[str | None] = mapped_column(String(30), nullable=True)
    payment_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    payment_period: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
