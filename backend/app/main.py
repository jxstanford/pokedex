from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import analyze, pokemon, health
from app.api.middleware import error_handler
from app.config import get_settings
from app.utils.pokemon_images import image_store_dir
from app.utils.logging import configure_logging


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging()
    app = FastAPI(
        title="Pokémon Vision API",
        version="0.1.0",
        docs_url=f"{settings.api_prefix}/docs",
        redoc_url=f"{settings.api_prefix}/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=True,
    )

    app.include_router(analyze.router, prefix=settings.api_prefix)
    app.include_router(pokemon.router, prefix=settings.api_prefix)
    app.include_router(health.router, prefix=settings.api_prefix)

    images_dir = image_store_dir()
    images_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/static/pokemon", StaticFiles(directory=images_dir), name="pokemon-images")

    error_handler.register_error_handlers(app)

    return app


app = create_app()
