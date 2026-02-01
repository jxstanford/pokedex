"""SQLAlchemy models for persistence."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID as PyUUID
from uuid import uuid4

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, INET
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    """Base declarative class."""


class PokemonRecord(Base):
    __tablename__ = "pokemon"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    types: Mapped[List[str]] = mapped_column(ARRAY(String(32)), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    genus: Mapped[str | None] = mapped_column(String(100))
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    generation: Mapped[int] = mapped_column(Integer, nullable=False)
    height: Mapped[float | None] = mapped_column(Float)
    weight: Mapped[float | None] = mapped_column(Float)
    abilities: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(64)))
    hp: Mapped[int | None] = mapped_column(Integer)
    attack: Mapped[int | None] = mapped_column(Integer)
    defense: Mapped[int | None] = mapped_column(Integer)
    special_attack: Mapped[int | None] = mapped_column(Integer)
    special_defense: Mapped[int | None] = mapped_column(Integer)
    speed: Mapped[int | None] = mapped_column(Integer)
    embedding: Mapped[Optional[List[float]]] = mapped_column(Vector(512), nullable=True)
    model_version: Mapped[Optional[str]] = mapped_column(String(100))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class AnalysisRequestRecord(Base):
    __tablename__ = "analysis_requests"

    id: Mapped[PyUUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    ip_address: Mapped[str | None] = mapped_column(INET)
    user_agent: Mapped[str | None] = mapped_column(Text)
    processing_time_ms: Mapped[int | None] = mapped_column(Integer)
    top_match_id: Mapped[int | None] = mapped_column(Integer)
    top_match_score: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
