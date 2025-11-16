from dataclasses import asdict
from datetime import datetime, timezone
from typing import List
from uuid import uuid4

from pydantic import BaseModel, Field, ConfigDict, field_serializer

from app.models.pokemon import Pokemon


class MatchResult(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    pokemon: Pokemon
    similarity_score: float = Field(ge=0.0, le=1.0)
    rank: int = Field(ge=1)

    @field_serializer("pokemon")
    def serialize_pokemon(self, value: Pokemon) -> dict:
        return asdict(value)


class AnalysisResult(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    id: str = Field(default_factory=lambda: str(uuid4()))
    matches: List[MatchResult] = Field(default_factory=list)
    processing_time_ms: int = 0
    model_version: str = "openai/clip-vit-base-patch32"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
