from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import Iterator

import httpx
from fastapi.testclient import TestClient
from PIL import Image
import pytest

from app.api.middleware.rate_limiter import reset_rate_limiter

FIXTURE_DIR = Path("tests/fixtures/sample_images")
FIXTURE_DIR.mkdir(parents=True, exist_ok=True)
PIKACHU_URL = (
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/"
    "sprites/pokemon/other/official-artwork/25.png"
)


@pytest.fixture(scope="module")
def pikachu_fixture() -> Iterator[Path]:
    target = FIXTURE_DIR / "pikachu.png"
    if not target.exists():
        response = httpx.get(PIKACHU_URL, timeout=30)
        response.raise_for_status()
        target.write_bytes(response.content)
    try:
        yield target
    finally:
        if target.exists():
            target.unlink()


def _make_image() -> BytesIO:
    img = Image.new("RGB", (64, 64), color="yellow")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


def test_analyze_returns_matches(client: TestClient, pikachu_fixture: Path) -> None:
    reset_rate_limiter()
    with pikachu_fixture.open("rb") as handle:
        response = client.post(
            "/api/v1/analyze/",
            files={"image": (pikachu_fixture.name, handle, "image/png")},
        )
    assert response.status_code == 200
    payload = response.json()
    assert 0 < len(payload["matches"]) <= 5


def test_analyze_respects_top_n(client: TestClient) -> None:
    reset_rate_limiter()
    buffer = _make_image()

    response = client.post(
        "/api/v1/analyze/?top_n=2",
        files={"image": ("pikachu.png", buffer, "image/png")},
    )
    assert response.status_code == 200
    payload = response.json()
    assert len(payload["matches"]) == 2


def test_analyze_rejects_invalid_format(client: TestClient) -> None:
    reset_rate_limiter()
    response = client.post(
        "/api/v1/analyze/",
        files={"image": ("test.txt", BytesIO(b"not image"), "text/plain")},
    )
    assert response.status_code == 400
    payload = response.json()
    assert payload["detail"]["error"] == "invalid_image"


def test_rate_limit_enforced(client: TestClient) -> None:
    reset_rate_limiter()
    buffer = _make_image()
    for _ in range(10):
        buffer.seek(0)
        resp = client.post(
            "/api/v1/analyze/",
            files={"image": ("pikachu.png", buffer, "image/png")},
        )
        assert resp.status_code == 200

    buffer.seek(0)
    response = client.post(
        "/api/v1/analyze/",
        files={"image": ("pikachu.png", buffer, "image/png")},
    )
    assert response.status_code == 429
