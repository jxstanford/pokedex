"""Pokédex data source abstraction."""

from __future__ import annotations

import asyncio
import hashlib
import json
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

from sqlalchemy import select, update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Pokemon, PokemonStats
from app.models.db import PokemonRecord
from app.services.pokemon_matcher import PokemonMatcher


class PokedexRepository:
    """Serve Pokémon metadata from Postgres with a local JSON fallback."""

    def __init__(
        self,
        session: AsyncSession | None = None,
        data_path: Path | None = None,
    ) -> None:
        self._session = session
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
        if self._session is None:
            await self._hydrate_cache_from_payload([pokemon])
            return

        record = self._domain_to_record(pokemon)
        await self._session.merge(record)
        await self._session.flush()
        self._pokemon_by_id[pokemon.id] = pokemon

    async def bulk_upsert(self, pokemon_list: Iterable[Pokemon]) -> None:
        for pokemon in pokemon_list:
            await self.add_or_update(pokemon)

    async def save_embedding(
        self,
        pokemon_id: int,
        embedding: List[float],
        model_version: str,
    ) -> None:
        if self._session is None:
            pokemon = self._pokemon_by_id.get(pokemon_id)
            if pokemon:
                pokemon.embedding = embedding
            return

        stmt = (
            update(PokemonRecord)
            .where(PokemonRecord.id == pokemon_id)
            .values(embedding=embedding, model_version=model_version)
        )
        await self._session.execute(stmt)
        await self._session.flush()
        if pokemon_id in self._pokemon_by_id:
            self._pokemon_by_id[pokemon_id].embedding = embedding

    async def record_analysis_request(
        self,
        *,
        ip_address: str | None,
        user_agent: str | None,
        processing_time_ms: int,
        top_match_id: int,
        top_match_score: float,
    ) -> None:
        if self._session is None:
            return

        from app.models.db import AnalysisRequestRecord

        record = AnalysisRequestRecord(
            ip_address=ip_address,
            user_agent=user_agent,
            processing_time_ms=processing_time_ms,
            top_match_id=top_match_id,
            top_match_score=top_match_score,
        )
        self._session.add(record)
        await self._session.flush()

    async def find_similar_by_embedding(
        self,
        embedding: List[float],
        top_n: int = 5,
    ) -> List[Tuple[Pokemon, float]]:
        if self._session is None:
            await self._ensure_cache()
            matcher = PokemonMatcher(list(self._pokemon_by_id.values()))
            matches = matcher.find_best_matches(embedding, top_n=top_n)
            return [(match.pokemon, match.similarity_score) for match in matches]

        distance_expr = PokemonRecord.embedding.cosine_distance(embedding)
        stmt = (
            select(PokemonRecord, distance_expr.label("distance"))
            .where(PokemonRecord.embedding.isnot(None))
            .order_by(distance_expr)
            .limit(top_n)
        )
        result = await self._session.execute(stmt)
        matches: List[Tuple[Pokemon, float]] = []
        for record, distance in result.all():
            pokemon = self._record_to_domain(record)
            similarity = 1.0 - (distance or 0.0)
            matches.append((pokemon, max(0.0, similarity)))
        return matches

    async def _ensure_cache(self) -> None:
        if self._pokemon_by_id:
            return
        if self._session is not None:
            try:
                result = await self._session.execute(select(PokemonRecord))
            except SQLAlchemyError:
                await self._hydrate_from_seed()
                return
            rows = result.scalars().all()
            if rows:
                for row in rows:
                    pokemon = self._record_to_domain(row)
                    self._pokemon_by_id[pokemon.id] = pokemon
                return
        await self._hydrate_from_seed()

    async def _hydrate_from_seed(self) -> None:
        if not self.data_path.exists():
            return
        payload = json.loads(self.data_path.read_text())
        await self._hydrate_cache_from_payload(payload)

    async def _hydrate_cache_from_payload(self, payload: Iterable[dict | Pokemon]) -> None:
        async with self._lock:
            for entry in payload:
                if isinstance(entry, Pokemon):
                    pokemon = entry
                else:
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
        embedding = entry.get("embedding")
        if embedding is None:
            embedding = self._embedding_from_seed(entry["name"])
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
            embedding=embedding,
        )

    def _record_to_domain(self, record: PokemonRecord) -> Pokemon:
        stats = PokemonStats(
            hp=record.hp or 0,
            attack=record.attack or 0,
            defense=record.defense or 0,
            special_attack=record.special_attack or 0,
            special_defense=record.special_defense or 0,
            speed=record.speed or 0,
        )
        return Pokemon(
            id=record.id,
            name=record.name,
            types=record.types or [],
            description=record.description or "",
            image_url=record.image_url,
            generation=record.generation,
            height=record.height or 0.0,
            weight=record.weight or 0.0,
            abilities=record.abilities or [],
            stats=stats,
            embedding=record.embedding,
        )

    def _domain_to_record(self, pokemon: Pokemon) -> PokemonRecord:
        return PokemonRecord(
            id=pokemon.id,
            name=pokemon.name,
            types=pokemon.types,
            description=pokemon.description,
            image_url=pokemon.image_url,
            generation=pokemon.generation,
            height=pokemon.height,
            weight=pokemon.weight,
            abilities=pokemon.abilities,
            hp=pokemon.stats.hp,
            attack=pokemon.stats.attack,
            defense=pokemon.stats.defense,
            special_attack=pokemon.stats.special_attack,
            special_defense=pokemon.stats.special_defense,
            speed=pokemon.stats.speed,
            embedding=pokemon.embedding,
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
