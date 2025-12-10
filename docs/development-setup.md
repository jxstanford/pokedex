# Development Setup Guide

This guide explains how to reproduce the local environment required for the Pokémon Vision stack.

## Prerequisites
- Python 3.11+
- [Poetry](https://python-poetry.org/docs/#installation)
- Node.js 20+ and npm
- Bun 1.2+ (frontend)
- Expo CLI (`npm install -g expo-cli`)
- Docker (for Postgres + pgvector, optional during Phase 0)
- OpenSpec + AI helpers:
  - openspec CLI (`pip install openspec-cli` or `pipx install openspec-cli`)
  - claude, codex, antigravity, opencode CLIs (global install via npm: `npm install -g claude-cli codex-cli antigravity-cli opencode-cli`, or use their official installers)

## Bootstrapping
1. Clone this repository.
2. Run `make bootstrap` from the repo root to install backend, frontend, and mobile dependencies.
3. Run `poetry install` inside `backend/` if you plan to execute the data scripts locally.
4. Copy `.env.example` (coming soon) into `.env` files for each project and fill in secrets.

## Running Services
- Run in separate terminals:
  - `make backend-dev`: FastAPI with reload at `http://localhost:8000`.
  - `make frontend-dev`: Vite dev server at `http://localhost:5173` (proxies `/api` to the backend).
  - `make mobile-dev`: Launches Expo for the iOS/Android preview (optional).

## Database
1. Start PostgreSQL 15+ locally (or via Docker) with the `pgvector` extension enabled.
2. Update `backend/.env` with `DATABASE_URL` if different from the default.
3. Run migrations: `cd backend && poetry run alembic upgrade head`.
4. Seed metadata: `poetry run python scripts/seed_pokemon_data.py --limit 151` (omit `--limit` for the full Pokédex).
5. Precompute embeddings: `poetry run python scripts/precompute_embeddings.py`.

## Testing
- `make backend-test`
- `make frontend-test`
- `make mobile-test`
- `make analyze-test`: Lightweight integration test using the in-memory Pokédex fallback.
- `make analyze-pgvector`: Full CLIP + pgvector flow (requires Postgres seeded with data and embeddings). Run `PGVECTOR_TESTS=1 make analyze-pgvector` after executing the seeding/embedding scripts.

## Pokémon Assets
Metadata and artwork URLs are pulled from PokéAPI (`https://pokeapi.co/api/v2`).
During development the backend loads a lightweight cache (`backend/app/data/pokemon_seed.json`)
containing official artwork URLs hosted on PokéAPI's GitHub CDN. Update or regenerate this
seed file as the synchronization scripts are implemented in later phases.

Update this file as deeper implementation details land (database migrations, seed scripts, etc.).
