from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/health/")
    assert response.status_code == 200
    payload = response.json()
    assert "status" in payload
    assert "checks" in payload
    assert "pokemon_count" in payload["checks"]
