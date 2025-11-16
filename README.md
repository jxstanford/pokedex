# Pokémon Vision Monorepo

This repository hosts the backend, frontend, mobile, and documentation assets for the Pokémon visual recognition experience described in `docs/pokemon-vision-spec.md`.

## Structure
- `backend/`: FastAPI service, data access, scripts, and tests.
- `frontend/`: React + TypeScript client delivered via Vite.
- `mobile/`: React Native/Expo project for the optional iOS client.
- `docs/`: Specifications, runbooks, and operational guides.

## Getting Started
1. Install prerequisites: Python 3.11, Poetry, Node 20+, npm, and Expo CLI (`npm install -g expo-cli`).
2. Run `make bootstrap` to install backend/frontend/mobile dependencies.
3. Start PostgreSQL + pgvector (e.g., `docker compose up db`), then run `cd backend && poetry run alembic upgrade head` to apply the schema.
4. (Optional) Populate the Pokédex and embeddings using the scripts under `backend/scripts/`.
5. Use `make backend-dev`, `make frontend-dev`, or `make mobile-dev` to run each target in watch mode.

See `docs/development-setup.md` for detailed instructions.
