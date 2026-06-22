from app.models.integration_status import IntegrationStatus
from app.schemas.integrations.status import (
    DigitalSignatureSampleDocument,
    DigitalSignatureStatusResponse,
    IntegrationModuleStatusResponse,
    MockWorkflowStep,
    OnlinePaymentsStatusResponse,
    TaxAuthorityStatusResponse,
)

SERVICE_NOT_FOUND_MESSAGE = "סטטוס אינטגרציה לדוגמה לא נמצא."


def _base_status(row: IntegrationStatus, disclaimer: str) -> IntegrationModuleStatusResponse:
    return IntegrationModuleStatusResponse(
        service_name=row.service_name,
        status=row.status,
        mode=row.mode,
        configured=row.configured,
        notes=row.notes,
        disclaimer=disclaimer,
        is_mock=True,
        data_source="sample",
    )


def build_tax_authority_status(row: IntegrationStatus) -> TaxAuthorityStatusResponse:
    return TaxAuthorityStatusResponse(
        **_base_status(
            row,
            "מתוכנן — אינו כלי דיווח מס רשמי ואינו מחובר לרשות המסים.",
        ).model_dump(),
        workflow_steps=[
            MockWorkflowStep(
                order=1,
                title="איסוף מסמכים (דוגמה)",
                description="העלאת מסמכים למערכת הפנימית — ללא שליחה לרשות.",
            ),
            MockWorkflowStep(
                order=2,
                title="בדיקה פנימית (דוגמה)",
                description="סקירת נתונים על ידי צוות המשרד.",
            ),
            MockWorkflowStep(
                order=3,
                title="הגשה עתידית (מתוכנן)",
                description="חיבור עתידי לרשות המסים — לא פעיל במערכת זו.",
            ),
        ],
    )


def build_digital_signature_status(row: IntegrationStatus) -> DigitalSignatureStatusResponse:
    return DigitalSignatureStatusResponse(
        **_base_status(
            row,
            "סטטוסי חתימה לדוגמה בלבד — ללא חתימה משפטית או חיבור לספק.",
        ).model_dump(),
        sample_documents=[
            DigitalSignatureSampleDocument(
                document_label="הסכם שירות — דוגמה",
                signature_status="ממתין לחתימה (דוגמה)",
                status_note="לא נשלח לספק חתימה",
            ),
            DigitalSignatureSampleDocument(
                document_label="נספח ניהול ספרים — דוגמה",
                signature_status="לא הופק (דוגמה)",
                status_note="סטטוס הדגמה בלבד",
            ),
        ],
    )


def build_online_payments_status(row: IntegrationStatus) -> OnlinePaymentsStatusResponse:
    return OnlinePaymentsStatusResponse(
        **_base_status(
            row,
            "מצב הדגמה — ללא סליקה, כרטיסי אשראי או קישורי תשלום.",
        ).model_dump(),
        concept_title="רעיון עתידי — גבייה מקוונת",
        concept_description=(
            "בגרסה עתידית, לקוחות יוכלו לקבל קישור תשלום חיצוני. "
            "ב-MVP הנוכחי רישום התשלומים מתבצע ידנית בלבד."
        ),
        manual_tracking_note="לרישום תשלומים ידני דרך פרטי לקוח — השתמשו בניהול הלקוחות.",
    )
