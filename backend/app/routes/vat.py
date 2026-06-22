from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.vat import VatCalculateRequest, VatCalculateResponse
from app.services.vat import compute_forward_vat, compute_reverse_vat
from app.utils.money_validation import MoneyValidationError

router = APIRouter(tags=["vat"])


def _validation_error(exc: MoneyValidationError) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=str(exc),
    )


@router.post("/vat/calculate", response_model=VatCalculateResponse)
def calculate_vat(
    body: VatCalculateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VatCalculateResponse:
    _ = db
    _ = current_user

    try:
        if body.mode == "from_before_vat":
            amount_before_vat, vat_amount, total_amount = compute_forward_vat(
                body.amount, body.vat_rate
            )
        else:
            amount_before_vat, vat_amount, total_amount = compute_reverse_vat(
                body.amount, body.vat_rate
            )
    except MoneyValidationError as exc:
        raise _validation_error(exc) from exc

    return VatCalculateResponse(
        mode=body.mode,
        vat_rate=body.vat_rate,
        amount_before_vat=amount_before_vat,
        vat_amount=vat_amount,
        total_amount=total_amount,
    )
