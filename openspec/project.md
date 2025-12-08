# Project Context

## Purpose
Monorepo for the Pokémon Vision experience: a FastAPI backend that analyzes user photos with CLIP embeddings to find the closest-matching Pokémon, plus planned React web and Expo mobile clients that display matches and Pokédex details.

## Tech Stack
- Backend: Python 3.11, FastAPI, SQLAlchemy (async), PostgreSQL + pgvector, Pydantic settings/models, torch/transformers (CLIP), structlog; managed with Poetry and Make targets.
- Data: Postgres schema for Pokémon metadata + 512-d embeddings; JSON seed fallback at `backend/app/data/pokemon_seed.json`; local image cache served from `/static/pokemon`.
- Frontend: React + TypeScript + Vite + Tailwind + React Query (planned; Makefile/README reference `frontend/` but it is not yet scaffolded).
- Mobile: React Native + Expo 50, TypeScript (`strict`), expo-camera/image-picker, Jest + ESLint.
- Tooling: Docker Compose for pgvector Postgres, Make targets for dev/test/lint, Node 20+, npm.

## Project Conventions

### Code Style
- Python: type-hinted everywhere; domain objects use dataclasses, API schemas use Pydantic models; async/await for I/O; 100-char lines via `ruff` config; `mypy` in `make lint`; structured JSON logging via `structlog`.
- Validation at the edge: `ImageProcessor.validate_image` enforces JPEG/PNG/WebP and 10MB limit; FastAPI dependencies provide DB session injection and rate limiting.
- JS/TS: TypeScript `strict` (see `mobile/tsconfig.json`); ESLint + Jest for Expo app; prefer functional React components and hooks when web client is added.
- Naming: snake_case for Python, camelCase/PascalCase for TS; API routes live under `/api/v1`.

### Architecture Patterns
- Layered FastAPI app: routers → dependencies → repositories/services → utils; settings injected via Pydantic.
- `PokedexRepository` caches Pokémon in memory, serves from Postgres when available, and falls back to the JSON seed + deterministic embeddings; can run without a DB session.
- `ImageProcessor` wraps CLIP loading/resizing/embedding; `PokemonMatcher` handles cosine similarity for offline matching; lightweight in-memory rate limiter middleware.
- SQLAlchemy models in `app/models/db.py` with pgvector columns; static Pokémon images stored under `backend/app/data/pokemon_images` and mounted via Starlette `StaticFiles`.

### Testing Strategy
- Pytest for backend unit/integration tests (`make backend-test`).
- API happy-path smoke: `make analyze-test` uses in-memory seed; full CLIP + pgvector flow via `PGVECTOR_TESTS=1 make analyze-pgvector` (requires seeded DB + embeddings).
- Linting gate: `make lint` runs `ruff` + `mypy` (backend) and ESLint (mobile).
- Mobile: Jest + React Native Testing Library ready via `npm test` (minimal coverage today).

### Git Workflow
- Work off feature branches and open PRs against the main branch; keep changes small and run `make lint`/relevant tests before raising a PR.
- No enforced commit prefix/format noted; use descriptive commit messages and reference tasks/spec changes when applicable.

## Domain Context
- Goal is to return top-N similar Pokémon (default 5, max 10) for an uploaded image; responses include Pokémon metadata and similarity scores.
- Allowed uploads: JPEG/PNG/WebP up to 10MB; anonymous usage with IP-based rate limiting (10 req/min).
- Pokémon data comes from PokéAPI; repository can seed from `pokemon_seed.json`, synthesize embeddings when missing, and swap to pgvector-backed similarity when DB is connected.
- CLIP model (`openai/clip-vit-base-patch32`) is loaded on startup; health endpoint reports cache/model status.

## Important Constraints
- Requires PostgreSQL 15+ with `pgvector` for production-grade similarity search; offline fallback is available but less accurate.
- CLIP weights download on first run (~hundreds of MB, needs CPU/RAM headroom).
- Enforce 10MB upload limit, mime-type whitelist, and 10 req/min/IP rate limit.
- No authentication in prototype; uploaded images are processed in-memory and not persisted.

## External Dependencies
- PokéAPI (`https://pokeapi.co/api/v2`) for Pokémon metadata and artwork (also used in tests/seed scripts).
- Hugging Face transformers/torch for `openai/clip-vit-base-patch32` model downloads.
- PostgreSQL with `pgvector` extension.
- Expo services for mobile development/bundling.
