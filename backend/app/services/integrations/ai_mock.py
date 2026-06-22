from app.schemas.integrations.status import AiMockSuggestion, AiMockSuggestionsResponse

AI_MOCK_SUGGESTIONS: tuple[AiMockSuggestion, ...] = (
    AiMockSuggestion(
        id="demo_suggestion_1",
        text="הצעת דוגמה: לבדוק מסמכים עם סטטוס חסר מידע ולעדכן את הלקוח.",
    ),
    AiMockSuggestion(
        id="demo_suggestion_2",
        text="הצעת דוגמה: לעבור על משימות דחופות שתאריך היעד שלהן קרוב.",
    ),
    AiMockSuggestion(
        id="demo_suggestion_3",
        text="הצעת דוגמה: לוודא שרשומות תשלום ידניות מעודכנות לתקופה הנוכחית.",
    ),
)


def build_ai_mock_suggestions() -> AiMockSuggestionsResponse:
    return AiMockSuggestionsResponse(
        suggestions=list(AI_MOCK_SUGGESTIONS),
        disclaimer="הצעות לדוגמה בלבד — ללא שליחה למודל AI וללא נתונים חיים מהמערכת.",
        is_mock=True,
        data_source="sample",
    )
