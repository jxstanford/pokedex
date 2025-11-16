from functools import lru_cache

from typing import Literal

from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration managed via environment variables."""

    environment: Literal["development", "test", "production"] = "development"
    database_url: str = "postgresql+asyncpg://pokedex:pokedex@localhost:5432/pokedex"
    api_prefix: str = "/api/v1"
    pokedex_api_base: AnyHttpUrl = "https://pokeapi.co/api/v2"
    clip_model_name: str = "openai/clip-vit-base-patch32"
    max_upload_bytes: int = 10 * 1024 * 1024
    allowed_origins: list[str] = ["*"]
    allowed_mime_types: tuple[str, ...] = ("image/jpeg", "image/png", "image/webp")
    rate_limit_requests_per_minute: int = 10

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""

    return Settings()
