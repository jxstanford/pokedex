"""Image analysis endpoint."""

from time import perf_counter
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status

from app.api.middleware.rate_limiter import enforce_rate_limit
from app.models import AnalysisResult
from app.repositories.pokedex_repository import PokedexRepository
from app.services.image_processor import ImageProcessor
from app.services.pokemon_matcher import PokemonMatcher

router = APIRouter(prefix="/analyze", tags=["analysis"])

_image_processor = ImageProcessor()
_matcher = PokemonMatcher()
_pokedex_repository = PokedexRepository()


def get_pokedex_repository() -> PokedexRepository:
    return _pokedex_repository


@router.post("/", response_model=AnalysisResult, status_code=status.HTTP_200_OK)
async def analyze_image(
    image: UploadFile = File(...),
    top_n: int = Query(5, ge=1, le=10),
    _: None = Depends(enforce_rate_limit),
    repository: PokedexRepository = Depends(get_pokedex_repository),
) -> AnalysisResult:
    payload = await image.read()
    try:
        embedding = _image_processor.process(payload, image.content_type)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "invalid_image", "message": str(exc)},
        ) from exc

    pokedex = await repository.get_all_pokemon()
    if not pokedex:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "service_unavailable", "message": "Pokédex cache is empty"},
        )
    _matcher.set_catalog(pokedex)

    start = perf_counter()
    matches = _matcher.find_best_matches(embedding, top_n=top_n)
    duration_ms = int((perf_counter() - start) * 1000)

    return AnalysisResult(
        id=str(uuid4()),
        matches=matches,
        processing_time_ms=duration_ms,
    )
