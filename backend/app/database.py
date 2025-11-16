from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings


settings = get_settings()
engine = create_async_engine(settings.database_url, echo=False, future=True)
SessionMaker = async_sessionmaker(engine, expire_on_commit=False)


@asynccontextmanager
async def get_session() -> AsyncSession:
    """Provide a transactional scope around a series of operations."""

    session = SessionMaker()
    try:
        yield session
    finally:
        await session.close()
