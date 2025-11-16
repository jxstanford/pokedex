"""Integration test for CLIP + pgvector analyze flow.

Requires a running PostgreSQL instance with seeded Pokémon data and
precomputed embeddings. Enable by setting PGVECTOR_TESTS=1.
"""

from __future__ import annotations

import os
from pathlib import Path

import httpx
import pytest

PG_TESTS_ENABLED = os.getenv("PGVECTOR_TESTS") == "1"

pytestmark = pytest.mark.skipif(
    not PG_TESTS_ENABLED,
    reason="Set PGVECTOR_TESTS=1 to run pgvector integration tests",
)


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


async def _ensure_env_ready(client) -> None:
    response = await client.get("/api/v1/health/")
    assert response.status_code == 200
    payload = response.json()
    pokemon_count = payload["checks"].get("pokemon_count", 0)
    assert pokemon_count > 0, "Seed data before running pgvector tests"
    assert payload["checks"].get("clip_model") == "loaded", "CLIP model not loaded"


@pytest.mark.anyio
async def test_analyze_pgvector_flow(async_client_with_db):
    await _ensure_env_ready(async_client_with_db)
    fixture = _download_fixture()
    with fixture.open("rb") as handle:
        response = await async_client_with_db.post(
            "/api/v1/analyze/",
            files={"image": (fixture.name, handle, "image/png")},
            data={"top_n": 3},
        )
    assert response.status_code == 200
    payload = response.json()
    assert payload["matches"], "Expected at least one match"
    assert payload["matches"][0]["similarity_score"] >= 0


def _download_fixture() -> Path:
    fixture_dir = Path("tests/fixtures/sample_images")
    fixture_dir.mkdir(parents=True, exist_ok=True)
    target = fixture_dir / "pikachu.png"
    if not target.exists():
        url = (
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/"
            "sprites/pokemon/other/official-artwork/25.png"
        )
        response = httpx.get(url, timeout=30)
        response.raise_for_status()
        target.write_bytes(response.content)
    return target
