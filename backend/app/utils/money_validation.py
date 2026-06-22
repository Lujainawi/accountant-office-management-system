from decimal import Decimal, InvalidOperation

MAX_MONEY = Decimal("999999999999.99")
MAX_VAT_RATE = Decimal("100.00")
TWO_PLACES = Decimal("0.01")

INVALID_FINITE_MESSAGE = "ערך כספי אינו תקין."
INVALID_AMOUNT_MESSAGE = "סכום חייב להיות ערך לא שלילי."
INVALID_VAT_RATE_MESSAGE = "שיעור מע״מ חייב להיות ערך לא שלילי."
INVALID_DECIMAL_SCALE_MESSAGE = "ערך כספי יכול לכלול לכל היותר שתי ספרות עשרוניות."
INVALID_VAT_SCALE_MESSAGE = "שיעור מע״מ יכול לכלול לכל היותר שתי ספרות עשרוניות."
INVALID_VAT_MAX_MESSAGE = "שיעור מע״מ לא יכול לעלות על 100.00."
EXCEEDS_MAX_MONEY_MESSAGE = "הערך חורג מהטווח המותר."
STORABLE_MONEY_OVERFLOW_MESSAGE = "סכומי המע״מ המחושבים חורגים מהטווח הניתן לשמירה."
EXPLICIT_NULL_VAT_RATE_MESSAGE = "שיעור מע״מ הוא שדה חובה."
EXPLICIT_NULL_AMOUNT_MESSAGE = "סכום לפני מע״מ הוא שדה חובה."
INVALID_FORM_AMOUNT_MESSAGE = "סכום לפני מע״מ הוא שדה חובה."
INVALID_FORM_VAT_RATE_MESSAGE = "שיעור מע״מ הוא שדה חובה."
INVALID_PAYMENT_AMOUNT_MESSAGE = "סכום התשלום חייב להיות ערך לא שלילי."
INVALID_PAYMENT_DECIMAL_SCALE_MESSAGE = (
    "סכום התשלום יכול לכלול לכל היותר שתי ספרות עשרוניות."
)
INVALID_PAYMENT_AMOUNT_FINITE_MESSAGE = "סכום התשלום אינו תקין."


class Omitted:
    """Sentinel for multipart fields intentionally omitted from the request."""


OMITTED = Omitted()


class MoneyValidationError(ValueError):
    pass


def _ensure_finite(value: Decimal) -> None:
    if not value.is_finite():
        raise MoneyValidationError(INVALID_FINITE_MESSAGE)


def _ensure_at_most_two_decimal_places(value: Decimal, *, scale_message: str) -> None:
    if value != value.quantize(TWO_PLACES):
        raise MoneyValidationError(scale_message)


def validate_amount_before_vat(value: Decimal) -> Decimal:
    _ensure_finite(value)
    if value < 0:
        raise MoneyValidationError(INVALID_AMOUNT_MESSAGE)
    _ensure_at_most_two_decimal_places(value, scale_message=INVALID_DECIMAL_SCALE_MESSAGE)
    if value > MAX_MONEY:
        raise MoneyValidationError(EXCEEDS_MAX_MONEY_MESSAGE)
    return value


def validate_payment_amount(value: Decimal) -> Decimal:
    _ensure_finite(value)
    if value < 0:
        raise MoneyValidationError(INVALID_PAYMENT_AMOUNT_MESSAGE)
    _ensure_at_most_two_decimal_places(
        value, scale_message=INVALID_PAYMENT_DECIMAL_SCALE_MESSAGE
    )
    if value > MAX_MONEY:
        raise MoneyValidationError(EXCEEDS_MAX_MONEY_MESSAGE)
    return value.quantize(TWO_PLACES)


def validate_vat_rate(value: Decimal) -> Decimal:
    _ensure_finite(value)
    if value < 0:
        raise MoneyValidationError(INVALID_VAT_RATE_MESSAGE)
    _ensure_at_most_two_decimal_places(value, scale_message=INVALID_VAT_SCALE_MESSAGE)
    if value > MAX_VAT_RATE:
        raise MoneyValidationError(INVALID_VAT_MAX_MESSAGE)
    return value


def validate_storable_money_values(
    amount_before_vat: Decimal,
    vat_amount: Decimal,
    total_amount: Decimal,
) -> None:
    for label, value in (
        ("amount_before_vat", amount_before_vat),
        ("vat_amount", vat_amount),
        ("total_amount", total_amount),
    ):
        _ = label
        _ensure_finite(value)
        if value < 0:
            raise MoneyValidationError(STORABLE_MONEY_OVERFLOW_MESSAGE)
        _ensure_at_most_two_decimal_places(
            value, scale_message=STORABLE_MONEY_OVERFLOW_MESSAGE
        )
        if value > MAX_MONEY:
            raise MoneyValidationError(STORABLE_MONEY_OVERFLOW_MESSAGE)


def parse_decimal_field(raw: str, *, invalid_message: str = INVALID_FINITE_MESSAGE) -> Decimal:
    text = raw.strip()
    if not text or text.lower() == "null":
        raise MoneyValidationError(invalid_message)
    try:
        value = Decimal(text)
    except InvalidOperation as exc:
        raise MoneyValidationError(invalid_message) from exc
    return value


def parse_multipart_amount(raw: str | None, *, key_present: bool) -> Decimal:
    if not key_present:
        raise MoneyValidationError(INVALID_FORM_AMOUNT_MESSAGE)
    if raw is None:
        raise MoneyValidationError(INVALID_FORM_AMOUNT_MESSAGE)
    return parse_decimal_field(raw, invalid_message=INVALID_FORM_AMOUNT_MESSAGE)


def parse_multipart_vat_rate(
    raw: str | None, *, key_present: bool
) -> Decimal | Omitted:
    if not key_present:
        return OMITTED
    if raw is None:
        raise MoneyValidationError(INVALID_FORM_VAT_RATE_MESSAGE)
    text = raw.strip()
    if not text or text.lower() == "null":
        raise MoneyValidationError(INVALID_FORM_VAT_RATE_MESSAGE)
    value = parse_decimal_field(text, invalid_message=INVALID_FORM_VAT_RATE_MESSAGE)
    return validate_vat_rate(value)
