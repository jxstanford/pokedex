import json

import pytest

from app.repositories.pokedex_repository import PokedexRepository
from app.utils.pokemon_images import local_image_url


class _EmptyResult:
    def scalars(self):
        return self

    def all(self):
        return []


class _EmptySession:
    async def execute(self, _):
        return _EmptyResult()


@pytest.mark.asyncio
async def test_find_similar_by_embedding_falls_back_when_pgvector_empty(tmp_path):
    seed_data = [
        {
            "id": 1,
            "name": "Bulbasaur",
            "types": ["grass"],
            "image_url": "https://example.com/1.png",
        },
        {
            "id": 4,
            "name": "Charmander",
            "types": ["fire"],
            "image_url": "https://example.com/4.png",
        },
    ]
    seed_path = tmp_path / "seed.json"
    seed_path.write_text(json.dumps(seed_data))

    repository = PokedexRepository(
        session=_EmptySession(),
        data_path=seed_path,
        image_store_dir=tmp_path / "images",
    )

    matches = await repository.find_similar_by_embedding([0.1, 0.2], top_n=2)

    assert len(matches) == 2
    assert {pokemon.name for pokemon, _ in matches} == {"Bulbasaur", "Charmander"}


@pytest.mark.asyncio
async def test_repository_prefers_local_image_when_available(tmp_path):
    seed_data = [
        {
            "id": 25,
            "name": "Pikachu",
            "types": ["electric"],
            "image_url": "https://example.com/pikachu.png",
        },
    ]
    seed_path = tmp_path / "seed.json"
    seed_path.write_text(json.dumps(seed_data))

    image_dir = tmp_path / "images"
    image_dir.mkdir()
    (image_dir / "25.png").write_bytes(b"fake")

    repository = PokedexRepository(
        session=_EmptySession(),
        data_path=seed_path,
        image_store_dir=image_dir,
    )

    pokemon = await repository.get_pokemon_by_id(25)

    assert pokemon is not None
    assert pokemon.image_url == local_image_url(25)
