from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app.api.middleware.rate_limiter import reset_rate_limiter


def _make_image() -> BytesIO:
    img = Image.new("RGB", (64, 64), color="yellow")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


def test_analyze_returns_matches(client: TestClient) -> None:
    reset_rate_limiter()
    buffer = _make_image()

    response = client.post(
        "/api/v1/analyze/",
        files={"image": ("pikachu.png", buffer, "image/png")},
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
