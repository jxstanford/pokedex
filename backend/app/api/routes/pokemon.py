"""Pokémon metadata endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_pokedex_repository
from app.models import Pokemon
from app.repositories.pokedex_repository import PokedexRepository

router = APIRouter(prefix="/pokemon", tags=["pokemon"])

@router.get("/{pokemon_id}", response_model=Pokemon)
async def get_pokemon(
    pokemon_id: int,
    repository: PokedexRepository = Depends(get_pokedex_repository),
) -> Pokemon:
    pokemon = await repository.get_pokemon_by_id(pokemon_id)
    if not pokemon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "pokemon_not_found", "message": "Pokémon not found"},
        )
    return pokemon
