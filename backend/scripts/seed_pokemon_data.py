"""Fetch Pokémon metadata from PokéAPI and persist it locally."""

from __future__ import annotations

import argparse
import asyncio
from typing import List

import httpx
from tqdm import tqdm

from app.config import get_settings
from app.database import SessionMaker
from app.models import Pokemon, PokemonStats
from app.repositories.pokedex_repository import PokedexRepository

settings = get_settings()


async def fetch_json(client: httpx.AsyncClient, url: str) -> dict:
    response = await client.get(url)
    response.raise_for_status()
    return response.json()


def extract_description(species_payload: dict) -> str:
    for flavor in species_payload.get("flavor_text_entries", []):
        if flavor.get("language", {}).get("name") == "en":
            text = flavor.get("flavor_text", "")
            return text.replace("\n", " ").replace("\u000c", " ")
    return ""


def parse_generation(species_payload: dict) -> int:
    generation_name = species_payload.get("generation", {}).get("name", "generation-i")
    parts = generation_name.split("-")
    roman = parts[-1] if parts else "i"
    mapping = {
        "i": 1,
        "ii": 2,
        "iii": 3,
        "iv": 4,
        "v": 5,
        "vi": 6,
        "vii": 7,
        "viii": 8,
        "ix": 9,
    }
    return mapping.get(roman, 1)


def map_to_domain(payload: dict, species_payload: dict) -> Pokemon:
    description = extract_description(species_payload)
    image_url = (
        payload.get("sprites", {})
        .get("other", {})
        .get("official-artwork", {})
        .get("front_default")
        or payload.get("sprites", {}).get("front_default")
        or ""
    )
    stats = payload.get("stats", [])
    stats_model = PokemonStats(
        hp=stats[0]["base_stat"] if len(stats) > 0 else 0,
        attack=stats[1]["base_stat"] if len(stats) > 1 else 0,
        defense=stats[2]["base_stat"] if len(stats) > 2 else 0,
        special_attack=stats[3]["base_stat"] if len(stats) > 3 else 0,
        special_defense=stats[4]["base_stat"] if len(stats) > 4 else 0,
        speed=stats[5]["base_stat"] if len(stats) > 5 else 0,
    )
    return Pokemon(
        id=payload["id"],
        name=payload["name"].title(),
        types=[entry["type"]["name"] for entry in payload["types"]],
        description=description,
        image_url=image_url,
        generation=parse_generation(species_payload),
        height=payload.get("height", 0) / 10,
        weight=payload.get("weight", 0) / 10,
        abilities=[ability["ability"]["name"] for ability in payload.get("abilities", [])],
        stats=stats_model,
    )


async def gather_pokemon(limit: int | None = None) -> List[Pokemon]:
    async with httpx.AsyncClient(timeout=30) as client:
        list_response = await client.get(
            f"{settings.pokedex_api_base}/pokemon",
            params={"limit": limit or 2000},
        )
        list_response.raise_for_status()
        results = list_response.json()["results"]
        if limit:
            results = results[:limit]

        pokemon: List[Pokemon] = []
        for entry in tqdm(results, desc="Downloading Pokémon"):
            detail = await fetch_json(client, entry["url"])
            species = await fetch_json(client, detail["species"]["url"])
            pokemon.append(map_to_domain(detail, species))
        return pokemon


async def seed_database(limit: int | None = None) -> None:
    pokemon = await gather_pokemon(limit)
    async with SessionMaker() as session:
        repo = PokedexRepository(session=session)
        await repo.bulk_upsert(pokemon)
        await session.commit()
    print(f"Stored {len(pokemon)} Pokémon records")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the Pokédex from PokéAPI")
    parser.add_argument("--limit", type=int, default=None, help="Limit Pokémon count (for testing)")
    args = parser.parse_args()
    asyncio.run(seed_database(args.limit))


if __name__ == "__main__":
    main()
