INVALID_EMAIL_PRESET_MESSAGE = "מזהה תצוגה מקדימה לדוגמה אינו תקין."

EMAIL_PRESETS: dict[str, dict[str, str]] = {
    "demo_client_followup": {
        "subject": "דוגמה — בקשה להשלמת מסמכים",
        "body": (
            "שלום,\n\n"
            "זוהי הודעת דוגמה בלבד לצורך הדגמה במערכת.\n"
            "נא להשלים את המסמכים החסרים לתקופה הנוכחית.\n\n"
            "בברכה,\n"
            "משרד לוי חשבונאות וניהול (דוגמה)"
        ),
    },
    "demo_document_request": {
        "subject": "דוגמה — תזכורת לקבלת קבלות",
        "body": (
            "שלום,\n\n"
            "זוהי הודעת דוגמה בלבד — לא נשלחה בפועל.\n"
            "נא לשלוח קבלות וחשבוניות עבור החודש האחרון.\n\n"
            "תודה,\n"
            "משרד לוי חשבונאות וניהול (דוגמה)"
        ),
    },
}


def build_email_preview(preset: str):
    from app.schemas.integrations.email import EmailPreviewResponse

    preset_data = EMAIL_PRESETS.get(preset)
    if preset_data is None:
        raise ValueError(INVALID_EMAIL_PRESET_MESSAGE)

    return EmailPreviewResponse(
        preset=preset,
        subject=preset_data["subject"],
        body=preset_data["body"],
        disclaimer="לא נשלח דוא״ל — זוהי תצוגה מקדימה לדוגמה בלבד.",
        is_mock=True,
        data_source="sample",
    )
