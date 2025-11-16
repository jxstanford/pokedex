"""Integration test for CLIP + pgvector analyze flow.

Requires a running PostgreSQL instance with seeded Pokémon data and
precomputed embeddings. Enable by setting PGVECTOR_TESTS=1.
"""

from __future__ import annotations

import asyncio
import os
from pathlib import Path

import pytest

from app.database import SessionMaker
from app.repositories.pokedex_repository import PokedexRepository

PG_TESTS_ENABLED = os.getenv("PGVECTOR_TESTS") == "1"

pytestmark = pytest.mark.skipif(
    not PG_TESTS_ENABLED,
    reason="Set PGVECTOR_TESTS=1 to run pgvector integration tests",
)


async def _ensure_embeddings_present() -> None:
    async with SessionMaker() as session:
        repo = PokedexRepository(session=session)
        pokemon = await repo.get_all_pokemon()
        if not pokemon:
            raise AssertionError("Seed the Pokédex before running pgvector tests")
        if not any(entry.embedding for entry in pokemon):
            raise AssertionError("Run precompute_embeddings.py before pgvector tests")


def test_analyze_pgvector_flow(client_with_db):
    asyncio.run(_ensure_embeddings_present())
    fixture = Path("tests/fixtures/sample_images/pikachu.png")
    with fixture.open("rb") as handle:
        response = client_with_db.post(
            "/api/v1/analyze/",
            files={"image": (fixture.name, handle, "image/png")},
            data={"top_n": 3},
        )
    assert response.status_code == 200
    payload = response.json()
    assert payload["matches"], "Expected at least one match"
    assert payload["matches"][0]["similarity_score"] >= 0
