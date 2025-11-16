"""Health endpoint."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.dependencies import get_pokedex_repository
from app.repositories.pokedex_repository import PokedexRepository

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
async def health(repository: PokedexRepository = Depends(get_pokedex_repository)) -> dict:
    pokemon_count = len(await repository.get_all_pokemon())
    now = datetime.now(timezone.utc)
    return {
        "status": "healthy" if pokemon_count else "degraded",
        "timestamp": now.isoformat(),
        "checks": {
            "pokedex_cache": "loaded" if pokemon_count else "empty",
            "pokemon_count": pokemon_count,
        },
    }
