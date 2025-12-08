"""Pre-compute CLIP embeddings for all Pokémon artwork."""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

import httpx
from tqdm import tqdm

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from app.config import get_settings
from app.database import SessionMaker
from app.repositories.pokedex_repository import PokedexRepository
from app.services.image_processor import ImageProcessor
from app.utils.pokemon_images import (
    image_store_dir,
    local_image_path,
    persist_image_bytes,
    sprite_fallback_url,
)

settings = get_settings()


def chunk(items, size):
    for i in range(0, len(items), size):
        yield items[i : i + size]


def ensure_image_url(url: str, pokemon_id: int) -> str:
    if url and url.startswith("http"):
        return url
    return sprite_fallback_url(pokemon_id)


async def download_image(client: httpx.AsyncClient, url: str) -> bytes:
    response = await client.get(url)
    response.raise_for_status()
    return response.content


async def precompute(limit: int | None = None) -> None:
    processor = ImageProcessor()
    async with SessionMaker() as session:
        repo = PokedexRepository(session=session)
        pokemon = await repo.get_all_pokemon()
        if limit:
            pokemon = pokemon[:limit]
        if not pokemon:
            raise RuntimeError("No Pokémon records available. Run seed_pokemon_data.py first.")

        store_dir = image_store_dir()
        async with httpx.AsyncClient(timeout=60) as client:
            for group in tqdm(chunk(pokemon, 10), desc="Embedding Pokémon"):
                images: list[bytes | Exception] = []
                for entry in group:
                    local_path = local_image_path(entry.id, root=store_dir)
                    if local_path.exists():
                        images.append(local_path.read_bytes())
                        continue
                    images.append(
                        await download_image(client, ensure_image_url(entry.image_url, entry.id))
                    )
                for entry, image_data in zip(group, images):
                    if isinstance(image_data, Exception):
                        print(f"Skipping {entry.name} - {image_data}")
                        continue
                    persist_image_bytes(image_data, entry.id, root=store_dir)
                    embedding = processor.extract_embedding(image_data)
                    await repo.save_embedding(entry.id, embedding, settings.clip_model_name)
        await session.commit()
    print(f"Computed embeddings for {len(pokemon)} Pokémon")


def main() -> None:
    parser = argparse.ArgumentParser(description="Pre-compute Pokémon embeddings")
    parser.add_argument("--limit", type=int, default=None, help="Limit Pokémon count for testing")
    args = parser.parse_args()
    asyncio.run(precompute(args.limit))


if __name__ == "__main__":
    main()
