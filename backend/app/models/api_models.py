from typing import Literal, Optional

from pydantic import BaseModel, Field


class AnalyzeQuery(BaseModel):
    top_n: int = Field(default=5, ge=1, le=10)


class ErrorResponse(BaseModel):
    error: Literal[
        "invalid_image",
        "file_too_large",
        "processing_failed",
        "pokemon_not_found",
        "rate_limit_exceeded",
    ]
    message: str
    details: Optional[dict] = None
