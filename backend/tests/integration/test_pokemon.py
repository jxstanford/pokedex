from fastapi.testclient import TestClient


def test_get_pokemon_returns_data(client: TestClient) -> None:
    response = client.get("/api/v1/pokemon/25")
    assert response.status_code == 200
    payload = response.json()
    assert payload["name"] == "Pikachu"


def test_get_pokemon_not_found(client: TestClient) -> None:
    response = client.get("/api/v1/pokemon/9999")
    assert response.status_code == 404
