"""Common FastAPI dependencies."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db_session
from app.repositories.pokedex_repository import PokedexRepository


async def get_pokedex_repository(
    session: AsyncSession = Depends(get_db_session),
) -> PokedexRepository:
    return PokedexRepository(session=session)
