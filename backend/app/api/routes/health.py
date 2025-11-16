"""Health endpoint."""

from datetime import datetime

from fastapi import APIRouter

from app.repositories.pokedex_repository import PokedexRepository

router = APIRouter(prefix="/health", tags=["health"])

_pokedex_repository = PokedexRepository()


@router.get("/")
async def health() -> dict:
    pokemon_count = len(await _pokedex_repository.get_all_pokemon())
    return {
        "status": "healthy" if pokemon_count else "degraded",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "checks": {
            "pokedex_cache": "loaded" if pokemon_count else "empty",
            "pokemon_count": pokemon_count,
        },
    }
