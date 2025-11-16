"""Similarity scoring helpers."""

from typing import List

from app.models import MatchResult, Pokemon


class PokemonMatcher:
    """Find Pokémon best matching a given embedding."""

    def __init__(self, pokedex: List[Pokemon] | None = None) -> None:
        self._pokedex = pokedex or []

    def set_catalog(self, pokedex: List[Pokemon]) -> None:
        self._pokedex = pokedex

    def find_best_matches(self, user_embedding: List[float], top_n: int = 5) -> List[MatchResult]:
        candidates: list[tuple[float, Pokemon]] = []
        for pokemon in self._pokedex:
            reference_embedding = pokemon.embedding or user_embedding
            score = self.calculate_similarity(user_embedding, reference_embedding)
            candidates.append((score, pokemon))

        sorted_matches = sorted(candidates, key=lambda item: item[0], reverse=True)[:top_n]

        return [
            MatchResult(
                pokemon=pokemon,
                similarity_score=max(0.0, score),
                rank=index,
            )
            for index, (score, pokemon) in enumerate(sorted_matches, start=1)
        ]

    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        if not embedding1 or not embedding2:
            return 0.0
        length = min(len(embedding1), len(embedding2))
        dot = sum(a * b for a, b in zip(embedding1[:length], embedding2[:length]))
        norm_a = sum(a * a for a in embedding1[:length]) ** 0.5
        norm_b = sum(b * b for b in embedding2[:length]) ** 0.5
        if not norm_a or not norm_b:
            return 0.0
        return dot / (norm_a * norm_b)
