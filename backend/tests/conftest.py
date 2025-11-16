import pytest
from fastapi.testclient import TestClient

from app.dependencies import get_pokedex_repository
from app.main import create_app
from app.repositories.pokedex_repository import PokedexRepository


@pytest.fixture(scope="session")
def client() -> TestClient:
    app = create_app()
    repository = PokedexRepository()

    async def override_repo() -> PokedexRepository:
        return repository

    app.dependency_overrides[get_pokedex_repository] = override_repo
    return TestClient(app)


@pytest.fixture(scope="session")
def client_with_db() -> TestClient:
    app = create_app()
    return TestClient(app)
