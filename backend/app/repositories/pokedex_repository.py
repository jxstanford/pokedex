"""Pokédex data source abstraction."""

from __future__ import annotations

import asyncio
import hashlib
import json
from pathlib import Path
from typing import Dict, List, Optional

from app.models import Pokemon, PokemonStats


class PokedexRepository:
    """Serve Pokémon metadata from disk (and later a database/remote API)."""

    def __init__(self, data_path: Path | None = None) -> None:
        self.data_path = data_path or Path(__file__).resolve().parent.parent / "data" / "pokemon_seed.json"
        self._pokemon_by_id: Dict[int, Pokemon] = {}
        self._lock = asyncio.Lock()

    async def get_all_pokemon(self) -> List[Pokemon]:
        await self._ensure_cache()
        return list(self._pokemon_by_id.values())

    async def get_pokemon_by_id(self, pokemon_id: int) -> Optional[Pokemon]:
        await self._ensure_cache()
        return self._pokemon_by_id.get(pokemon_id)

    async def add_or_update(self, pokemon: Pokemon) -> None:
        async with self._lock:
            self._pokemon_by_id[pokemon.id] = pokemon

    async def hydrate_from_payload(self, payload: List[dict]) -> None:
        for entry in payload:
            await self.add_or_update(self._build_pokemon(entry))

    async def _ensure_cache(self) -> None:
        if self._pokemon_by_id:
            return
        if not self.data_path.exists():
            return
        raw = json.loads(self.data_path.read_text())
        for entry in raw:
            pokemon = self._build_pokemon(entry)
            self._pokemon_by_id[pokemon.id] = pokemon

    def _build_pokemon(self, entry: dict) -> Pokemon:
        stats_payload = entry.get("stats", {})
        stats = PokemonStats(
            hp=stats_payload.get("hp", 0),
            attack=stats_payload.get("attack", 0),
            defense=stats_payload.get("defense", 0),
            special_attack=stats_payload.get("special_attack", 0),
            special_defense=stats_payload.get("special_defense", 0),
            speed=stats_payload.get("speed", 0),
        )
        return Pokemon(
            id=entry["id"],
            name=entry["name"],
            types=entry.get("types", []),
            description=entry.get("description", ""),
            image_url=entry.get("image_url", ""),
            generation=entry.get("generation", 0),
            height=entry.get("height", 0.0),
            weight=entry.get("weight", 0.0),
            abilities=entry.get("abilities", []),
            stats=stats,
            embedding=self._embedding_from_seed(entry["name"]),
        )

    def _embedding_from_seed(self, seed_value: str) -> List[float]:
        digest = hashlib.sha256(seed_value.encode("utf-8")).digest()
        values: List[float] = []
        seed = digest
        while len(values) < 512:
            seed = hashlib.sha256(seed).digest()
            values.extend(byte / 255 for byte in seed)
        trimmed = values[:512]
        norm = sum(v * v for v in trimmed) ** 0.5 or 1.0
        return [v / norm for v in trimmed]
