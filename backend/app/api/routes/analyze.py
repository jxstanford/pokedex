"""Image analysis endpoint."""

from time import perf_counter
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status, Request

from app.api.middleware.rate_limiter import enforce_rate_limit
from app.dependencies import get_pokedex_repository
from app.models import AnalysisResult, MatchResult
from app.repositories.pokedex_repository import PokedexRepository
from app.services.image_processor import ImageProcessor

router = APIRouter(prefix="/analyze", tags=["analysis"])

_image_processor = ImageProcessor()
@router.post("/", response_model=AnalysisResult, status_code=status.HTTP_200_OK)
async def analyze_image(
    request: Request,
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

    start = perf_counter()
    matches_with_scores = await repository.find_similar_by_embedding(embedding, top_n)
    if not matches_with_scores:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "service_unavailable", "message": "Pokédex cache is empty"},
        )
    duration_ms = int((perf_counter() - start) * 1000)
    matches = [
        MatchResult(pokemon=pokemon, similarity_score=score, rank=index)
        for index, (pokemon, score) in enumerate(matches_with_scores, start=1)
    ]

    result = AnalysisResult(
        id=str(uuid4()),
        matches=matches,
        processing_time_ms=duration_ms,
    )
    if matches:
        await repository.record_analysis_request(
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            processing_time_ms=duration_ms,
            top_match_id=matches[0].pokemon.id,
            top_match_score=matches[0].similarity_score,
        )

    return result
