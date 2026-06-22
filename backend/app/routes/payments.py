from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.crud.payment import (
    CLIENT_ID_REQUIRED_MESSAGE,
    DOCUMENT_CLIENT_MISMATCH_MESSAGE,
    INVALID_CLIENT_MESSAGE,
    INVALID_DOCUMENT_MESSAGE,
    NOT_FOUND_MESSAGE,
    create_payment,
    delete_payment,
    get_payment,
    list_payments,
    update_payment,
)
from app.database import get_db
from app.dependencies import get_current_user
from app.models.payment import PAYMENT_STATUSES
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentResponse, PaymentUpdate, payment_to_response

router = APIRouter(tags=["payments"])


def _get_payment_or_404(db: Session, payment_id: int):
    payment = get_payment(db, payment_id)
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=NOT_FOUND_MESSAGE)
    return payment


def _validation_error(exc: ValueError) -> HTTPException:
    message = str(exc)
    if message in {INVALID_CLIENT_MESSAGE, INVALID_DOCUMENT_MESSAGE, NOT_FOUND_MESSAGE}:
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message)
    if message == DOCUMENT_CLIENT_MISMATCH_MESSAGE:
        return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=message)
    if message == CLIENT_ID_REQUIRED_MESSAGE:
        return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=message)
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=message)


@router.post("/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def post_payment(
    body: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentResponse:
    _ = current_user
    try:
        return create_payment(db, body)
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.get("/payments", response_model=list[PaymentResponse])
def get_payments(
    client_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[PaymentResponse]:
    _ = current_user

    if client_id is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=CLIENT_ID_REQUIRED_MESSAGE,
        )

    try:
        return list_payments(db, client_id=client_id)
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.get("/payments/{payment_id}", response_model=PaymentResponse)
def get_payment_by_id(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentResponse:
    _ = current_user
    payment = _get_payment_or_404(db, payment_id)
    return payment_to_response(payment)


@router.put("/payments/{payment_id}", response_model=PaymentResponse)
def put_payment(
    payment_id: int,
    body: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentResponse:
    _ = current_user
    payment = _get_payment_or_404(db, payment_id)

    try:
        return update_payment(db, payment, body)
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.delete("/payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    _ = current_user
    payment = _get_payment_or_404(db, payment_id)

    try:
        delete_payment(db, payment)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
