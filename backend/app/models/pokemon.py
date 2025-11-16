from dataclasses import dataclass, field
from typing import List, Optional


@dataclass(slots=True)
class PokemonStats:
    hp: int = 0
    attack: int = 0
    defense: int = 0
    special_attack: int = 0
    special_defense: int = 0
    speed: int = 0


@dataclass(slots=True)
class Pokemon:
    id: int
    name: str
    types: List[str]
    description: str = ""
    image_url: str = ""
    generation: int = 0
    height: float = 0
    weight: float = 0
    abilities: List[str] = field(default_factory=list)
    stats: PokemonStats = field(default_factory=PokemonStats)
    embedding: Optional[List[float]] = None
