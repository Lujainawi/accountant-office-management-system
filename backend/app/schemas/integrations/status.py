from pydantic import BaseModel, Field


class MockWorkflowStep(BaseModel):
    order: int
    title: str
    description: str


class IntegrationModuleStatusResponse(BaseModel):
    service_name: str
    status: str
    mode: str
    configured: bool
    notes: str | None = None
    disclaimer: str
    is_mock: bool = True
    data_source: str = "sample"


class TaxAuthorityStatusResponse(IntegrationModuleStatusResponse):
    workflow_steps: list[MockWorkflowStep]


class DigitalSignatureSampleDocument(BaseModel):
    document_label: str
    signature_status: str
    status_note: str


class DigitalSignatureStatusResponse(IntegrationModuleStatusResponse):
    sample_documents: list[DigitalSignatureSampleDocument]


class OnlinePaymentsStatusResponse(IntegrationModuleStatusResponse):
    concept_title: str
    concept_description: str
    manual_tracking_note: str


class AiMockSuggestion(BaseModel):
    id: str
    text: str


class AiMockSuggestionsResponse(BaseModel):
    suggestions: list[AiMockSuggestion]
    disclaimer: str
    is_mock: bool = True
    data_source: str = "sample"
