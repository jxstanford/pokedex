"""Helpers for choosing and storing Pokémon artwork URLs."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional


DEFAULT_IMAGE_DIR = Path(__file__).resolve().parent.parent / "data" / "pokemon_images"


def image_store_dir(root: Path | None = None) -> Path:
    return root or DEFAULT_IMAGE_DIR


def local_image_path(pokemon_id: int, *, root: Path | None = None) -> Path:
    return image_store_dir(root) / f"{pokemon_id}.png"


def local_image_url(pokemon_id: int) -> str:
    return f"/static/pokemon/{pokemon_id}.png"


def persist_image_bytes(
    image_data: bytes,
    pokemon_id: int,
    *,
    root: Path | None = None,
) -> Path:
    target = local_image_path(pokemon_id, root=root)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(image_data)
    return target


def sprite_fallback_url(pokemon_id: int) -> str:
    """Return a reliable sprite URL for the given Pokémon id."""
    return (
        "https://raw.githubusercontent.com/PokeAPI/"
        f"sprites/master/sprites/pokemon/{pokemon_id}.png"
    )


def choose_image_url(
    sprites: Dict[str, Any],
    *,
    species_id: Optional[int],
    pokemon_id: int,
) -> str:
    """Pick the best available image URL, falling back to a sprite if artwork is missing."""
    other = sprites.get("other", {}) if isinstance(sprites, dict) else {}
    candidates = [
        other.get("official-artwork", {}).get("front_default"),
        other.get("home", {}).get("front_default"),
        other.get("dream_world", {}).get("front_default"),
        sprites.get("front_default") if isinstance(sprites, dict) else None,
    ]
    for url in candidates:
        if url:
            return url

    fallback_id = species_id or pokemon_id
    return sprite_fallback_url(fallback_id)
