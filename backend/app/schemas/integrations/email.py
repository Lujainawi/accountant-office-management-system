from pydantic import BaseModel, ConfigDict, Field


class EmailPreviewRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    preset: str = Field(min_length=1, max_length=80)


class EmailPreviewResponse(BaseModel):
    preset: str
    subject: str
    body: str
    disclaimer: str
    is_mock: bool = True
    data_source: str = "sample"
