from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

DOCUMENT_TYPES = (
    "invoice",
    "receipt",
    "report",
    "bank_document",
    "other",
)

DOCUMENT_STATUSES = (
    "new",
    "in_progress",
    "completed",
    "missing_information",
)


class Document(Base):
    __tablename__ = "documents"
    __table_args__ = (
        Index("ix_documents_client_id", "client_id"),
        Index("ix_documents_client_id_document_date", "client_id", "document_date"),
        Index("ix_documents_status", "status"),
        Index("ix_documents_document_type", "document_type"),
        Index("ix_documents_document_date", "document_date"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    client_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("clients.id"), nullable=False
    )
    document_name: Mapped[str] = mapped_column(String(255), nullable=False)
    document_type: Mapped[str] = mapped_column(String(30), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(120), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    document_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount_before_vat: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    vat_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    vat_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
