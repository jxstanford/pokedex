"""Fetch Pokémon metadata from PokéAPI and persist it locally."""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path
from typing import List

import httpx
from tqdm import tqdm

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from app.config import get_settings
from app.database import SessionMaker
from app.models import Pokemon, PokemonStats
from app.repositories.pokedex_repository import PokedexRepository
from app.utils.pokemon_images import choose_image_url

settings = get_settings()


async def fetch_json(
    client: httpx.AsyncClient,
    url: str,
    *,
    retries: int = 5,
    backoff_seconds: float = 1.0,
) -> dict:
    for attempt in range(retries):
        try:
            response = await client.get(url)
            response.raise_for_status()
            try:
                return response.json()
            except ValueError as exc:
                raise RuntimeError(f"Failed to decode JSON from {url}") from exc
        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code
            if status == 429 or status >= 500:
                delay = backoff_seconds * (2**attempt)
                print(f"HTTP {status} for {url}. Retrying in {delay:.1f}s...")
                await asyncio.sleep(delay)
                continue
            raise
        except httpx.HTTPError as exc:
            delay = backoff_seconds * (2**attempt)
            print(f"Network error '{exc}' for {url}. Retrying in {delay:.1f}s...")
            await asyncio.sleep(delay)
    raise RuntimeError(f"Exceeded retries for {url}")


def extract_description(species_payload: dict) -> str:
    for flavor in species_payload.get("flavor_text_entries", []):
        if flavor.get("language", {}).get("name") == "en":
            text = flavor.get("flavor_text", "")
            return text.replace("\n", " ").replace("\u000c", " ")
    return ""


def extract_genus(species_payload: dict) -> str:
    for genus_entry in species_payload.get("genera", []):
        if genus_entry.get("language", {}).get("name") == "en":
            return genus_entry.get("genus", "")
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
    image_url = choose_image_url(
        payload.get("sprites", {}),
        species_id=species_payload.get("id"),
        pokemon_id=payload["id"],
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
        genus=extract_genus(species_payload),
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
        payload = list_response.json()
        results = payload.get("results", [])
        if limit:
            results = results[:limit]

        pokemon: List[Pokemon] = []
        failures: list[str] = []
        for entry in tqdm(results, desc="Downloading Pokémon"):
            try:
                detail = await fetch_json(client, entry["url"])
                species = await fetch_json(client, detail["species"]["url"])
                pokemon.append(map_to_domain(detail, species))
            except Exception as exc:  # noqa: BLE001 - log and continue
                failures.append(f"{entry.get('name', 'unknown')}: {exc}")
                print(f"Skipping {entry.get('name', 'unknown')} due to {exc}")
                continue

        if failures:
            print(f"Skipped {len(failures)} Pokémon due to errors")
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
