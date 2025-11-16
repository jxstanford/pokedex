"""Pre-compute CLIP embeddings for all Pokémon artwork."""

from __future__ import annotations

import argparse
import asyncio

import httpx
from tqdm import tqdm

from app.config import get_settings
from app.database import SessionMaker
from app.repositories.pokedex_repository import PokedexRepository
from app.services.image_processor import ImageProcessor

settings = get_settings()


def chunk(items, size):
    for i in range(0, len(items), size):
        yield items[i : i + size]


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

        async with httpx.AsyncClient(timeout=60) as client:
            for group in tqdm(chunk(pokemon, 10), desc="Embedding Pokémon"):
                tasks = [download_image(client, p.image_url) for p in group]
                images = await asyncio.gather(*tasks)
                for entry, image_data in zip(group, images):
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
