# Repository Guidelines

## Project Structure & Module Organization
- `backend/`: FastAPI service; routers in `app/api`, domain models in `app/models`, repositories/services in `app/repositories` and `app/services`; tests live in `backend/tests/{unit,integration}`.
- `frontend/`: Vite + React + TypeScript; UI pieces in `src/components`, views in `src/pages`, hooks in `src/hooks`, state in `src/store`, API clients in `src/services`.
- `mobile/`: Expo/React Native client; mirror web flows where possible so names stay aligned; Jest-driven tests live next to code.
- `docs/`: Specs and runbooks; update when endpoints, flows, or data contracts change.

## Build, Test, and Development Commands
- `make bootstrap`: Install backend, frontend, and mobile dependencies.
- `make backend-dev` | `make frontend-dev` | `make mobile-dev`: Run dev servers (8000, 5173, and Expo tunnel).
- `make backend-test` | `make frontend-test` | `make mobile-test`: Project-specific test suites.
- `make analyze-test`: FastAPI `/api/v1/analyze` integration using in-memory data.
- `PGVECTOR_TESTS=1 make analyze-pgvector`: Full CLIP + pgvector flow (requires Postgres + seeded embeddings).
- Database setup: `cd backend && poetry run alembic upgrade head`, then `poetry run python scripts/seed_pokemon_data.py --limit 151` and `poetry run python scripts/precompute_embeddings.py` to load data.

## Coding Style & Naming Conventions
- Python: 4-space indent, Ruff line length 100; favor type hints and Pydantic models for request/response shapes; keep routes under `app/api` and persistence in `app/repositories`.
- Frontend: TypeScript with ESLint (React + hooks rules). Use functional components, PascalCase for components, camelCase for hooks/utils; co-locate UI styles with components; keep API calls in `src/services`.
- Mobile: TypeScript/React Native; reuse naming from the web app for shared concepts; mock device APIs in tests.
- Run `make lint` before pushes; Ruff, mypy, and ESLint are the source of truth for formatting and correctness.

## Testing Guidelines
- Backend: Pytest; name files `test_*.py`, prefer `backend/tests/unit` for pure logic and `backend/tests/integration` for HTTP/DB flows; keep shared fixtures in `backend/tests/fixtures`.
- Frontend: Vitest + Testing Library in `frontend/tests` or alongside components; mock network calls; keep snapshots small.
- Mobile: Jest for component logic; avoid hitting device APIs directly—mock Expo modules.
- Cover new endpoints/components with happy-path and failure cases; rerun `make analyze-*` when touching the analyze pipeline.

## Commit & Pull Request Guidelines
- Follow the conventional commit style used here (`feat(frontend): ...`, `fix(frontend): ...`, `chore(...)`); scope commits to the area touched.
- PRs should describe intent, list setup/verification steps, link issues, and include UI screenshots/recordings for visible changes.
- Call out DB migrations or seeding requirements and update `docs/` when behavior or contracts shift.
