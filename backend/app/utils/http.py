"""HTTP utilities."""

from __future__ import annotations

from typing import Any

import httpx


async def fetch_json(client: httpx.AsyncClient, url: str) -> Any:
    response = await client.get(url)
    response.raise_for_status()
    try:
        return response.json()
    except ValueError as exc:
        raise RuntimeError(f"Failed to decode JSON from {url}") from exc
