"""Health endpoint."""

from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends

from app.dependencies import get_pokedex_repository
from app.repositories.pokedex_repository import PokedexRepository
from app.services.image_processor import ImageProcessor

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
async def health(repository: PokedexRepository = Depends(get_pokedex_repository)) -> dict:
    pokemon_count = len(await repository.get_all_pokemon())
    now = datetime.now(timezone.utc)
    model_status: Literal["loaded", "unloaded"] = (
        "loaded" if ImageProcessor._clip_model is not None else "unloaded"
    )
    overall_status = "healthy" if pokemon_count and model_status == "loaded" else "degraded"
    return {
        "status": overall_status,
        "timestamp": now.isoformat(),
        "checks": {
            "pokedex_cache": "loaded" if pokemon_count else "empty",
            "pokemon_count": pokemon_count,
            "clip_model": model_status,
        },
    }
