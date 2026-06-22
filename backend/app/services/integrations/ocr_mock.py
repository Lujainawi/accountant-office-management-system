from decimal import Decimal

INVALID_OCR_PRESET_MESSAGE = "מזהה מסמך דוגמה אינו תקין."

OCR_PRESETS: dict[str, dict[str, str | Decimal]] = {
    "demo_invoice_1": {
        "vendor_name": "סטודיו דנה — עיצוב פנים (דוגמה)",
        "document_name": "חשבונית דוגמה — מאי 2026",
        "document_date": "2026-05-15",
        "amount_before_vat": Decimal("1000.00"),
        "vat_rate": Decimal("18.00"),
        "vat_amount": Decimal("180.00"),
        "total_amount": Decimal("1180.00"),
        "currency": "ILS",
    },
    "demo_invoice_2": {
        "vendor_name": "ברק פתרונות בע״מ (דוגמה)",
        "document_name": "דוח דוגמה — אפריל 2026",
        "document_date": "2026-04-30",
        "amount_before_vat": Decimal("2500.00"),
        "vat_rate": Decimal("18.00"),
        "vat_amount": Decimal("450.00"),
        "total_amount": Decimal("2950.00"),
        "currency": "ILS",
    },
}


def build_ocr_mock_result(preset: str):
    from app.schemas.integrations.ocr import OcrExtractedFields, OcrMockProcessResponse

    preset_data = OCR_PRESETS.get(preset)
    if preset_data is None:
        raise ValueError(INVALID_OCR_PRESET_MESSAGE)

    extracted = OcrExtractedFields(
        vendor_name=str(preset_data["vendor_name"]),
        document_name=str(preset_data["document_name"]),
        document_date=str(preset_data["document_date"]),
        amount_before_vat=Decimal(str(preset_data["amount_before_vat"])),
        vat_rate=Decimal(str(preset_data["vat_rate"])),
        vat_amount=Decimal(str(preset_data["vat_amount"])),
        total_amount=Decimal(str(preset_data["total_amount"])),
        currency=str(preset_data["currency"]),
    )

    return OcrMockProcessResponse(
        preset=preset,
        extracted_fields=extracted,
        disclaimer="זהו מסמך דוגמה בלבד. לא מועלה ולא מעובד קובץ אמיתי.",
        is_mock=True,
        data_source="sample",
    )
