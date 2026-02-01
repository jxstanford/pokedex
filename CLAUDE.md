<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pokémon Vision is a full-stack computer vision application that identifies Pokémon from images using OpenAI's CLIP model. The system consists of:

- **Backend**: FastAPI (Python 3.11+) with PostgreSQL + pgvector for embedding similarity search
- **Frontend**: React + TypeScript + Vite with Bun as package manager
- **Mobile**: React Native/Expo (optional iOS client)
- **Vision Model**: CLIP (openai/clip-vit-base-patch32) running locally, no API costs

## Quick Start Commands

### Environment Setup
```bash
# Bootstrap all dependencies (backend, frontend, mobile)
make bootstrap

# Individual setups
cd backend && poetry install --no-root
cd frontend && bun install
cd mobile && npm install
```

### Running Development Servers
```bash
# Start both backend and frontend
make start

# Backend only (http://localhost:8000)
make backend-dev
# or: cd backend && poetry run uvicorn app.main:app --reload

# Frontend only (http://localhost:5173)
make frontend-dev
# or: cd frontend && bun run dev -- --host

# Mobile (Expo tunnel mode)
make mobile-dev
# or: cd mobile && npx expo start --tunnel

# Stop all servers
make stop
```

### Database Setup
```bash
# Start PostgreSQL + pgvector via Docker
docker compose up db

# Run migrations
cd backend && poetry run alembic upgrade head

# Seed Pokémon data (--limit 151 for Gen 1 only, omit for all ~1025)
cd backend && poetry run python scripts/seed_pokemon_data.py --limit 151

# Precompute CLIP embeddings for all Pokémon
cd backend && poetry run python scripts/precompute_embeddings.py
```

### Testing Commands
```bash
# Backend tests
make backend-test
# or: cd backend && poetry run pytest

# Specific test file
cd backend && poetry run pytest tests/unit/test_pokemon_images.py

# With coverage
cd backend && poetry run pytest --cov=app

# Integration test with in-memory fallback (no DB required)
make analyze-test
# or: cd backend && poetry run pytest tests/integration/test_analyze.py -k "returns_matches"

# Full pgvector integration test (requires seeded DB)
make analyze-pgvector
# or: cd backend && PGVECTOR_TESTS=1 poetry run pytest tests/integration/test_analyze_pgvector.py

# Frontend tests
make frontend-test
# or: cd frontend && bun run test -- --run
```

### Code Quality
```bash
# Backend linting and type checking
cd backend && poetry run ruff check .
cd backend && poetry run mypy .

# Frontend linting
cd frontend && bun run test -- --passWithNoTests
```

## Architecture Overview

### Backend Structure (London-Style TDD)

```
backend/app/
├── main.py                    # FastAPI app factory, CORS, middleware
├── config.py                  # Pydantic Settings for environment config
├── database.py                # SQLAlchemy async engine
├── dependencies.py            # FastAPI dependency injection
├── models/
│   ├── pokemon.py             # Domain models (Pokemon, Stats)
│   ├── analysis.py            # AnalysisResult, MatchResult
│   ├── api_models.py          # Pydantic request/response schemas
│   └── db.py                  # SQLAlchemy ORM models
├── services/
│   ├── image_processor.py     # CLIP embedding extraction
│   ├── pokemon_matcher.py     # Cosine similarity matching
│   └── validators.py          # Image validation
├── repositories/
│   └── pokedex_repository.py  # Data access layer (PokéAPI + DB)
├── api/
│   ├── routes/
│   │   ├── analyze.py         # POST /api/v1/analyze
│   │   ├── pokemon.py         # GET /api/v1/pokemon/{id}
│   │   └── health.py          # GET /api/v1/health
│   └── middleware/
│       ├── rate_limiter.py    # 10 req/min per IP
│       └── error_handler.py   # Global exception handling
└── utils/
    ├── logging.py             # Structured logging
    ├── pokemon_images.py      # Image storage utilities
    └── http.py                # HTTP helpers
```

**Key Patterns:**
- **Dependency Injection**: FastAPI's `Depends()` for repositories and services
- **Mocking Strategy**: All tests mock CLIP model and external APIs (PokéAPI)
- **Async Throughout**: All I/O operations use `async`/`await`
- **Type Safety**: Full type hints with mypy validation

### Frontend Structure

```
frontend/src/
├── App.tsx                    # Main app, state management, history
├── main.tsx                   # React entry point
├── types.ts                   # TypeScript interfaces
├── lib/
│   └── api.ts                 # Backend API client
├── components/
│   ├── RotomPhone.tsx         # Phone UI shell with view routing
│   ├── HomeView.tsx           # Upload/camera initial screen
│   ├── UploadView.tsx         # File upload interface
│   ├── CameraView.tsx         # Live camera capture
│   ├── ResultsView.tsx        # Match results display
│   ├── HistoryView.tsx        # Analysis history
│   ├── PokemonDetail.tsx      # Pokémon stats modal
│   ├── MatchResults.tsx       # Match cards grid
│   ├── RecentAnalyses.tsx     # History entries
│   └── figma/                 # Design system components
└── test/
    └── setup.ts               # Vitest configuration
```

**State Management:**
- **Local State**: React hooks (`useState`, `useEffect`)
- **LocalStorage**: Analysis history persistence (max 6 entries)
- **Detail Cache**: In-memory Pokémon detail cache to avoid re-fetching

### Database Schema

```sql
-- Core Pokémon table with pgvector embeddings
CREATE TABLE pokemon (
    id INTEGER PRIMARY KEY,           -- National Dex number
    name VARCHAR(100) NOT NULL,
    types TEXT[] NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    generation INTEGER NOT NULL,
    height REAL,                      -- meters
    weight REAL,                      -- kilograms
    abilities TEXT[],
    hp INTEGER,
    attack INTEGER,
    defense INTEGER,
    special_attack INTEGER,
    special_defense INTEGER,
    speed INTEGER,
    embedding vector(512),            -- CLIP embedding
    model_version VARCHAR(100),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vector similarity search index
CREATE INDEX ON pokemon USING ivfflat (embedding vector_cosine_ops);

-- Analytics table for request logging
CREATE TABLE analysis_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET,
    user_agent TEXT,
    processing_time_ms INTEGER,
    top_match_id INTEGER REFERENCES pokemon(id),
    top_match_score REAL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Core Workflows

### Image Analysis Flow

1. **Frontend**: User uploads/captures image → `api.analyzeImage(file, top_n=5)`
2. **Backend**: `POST /api/v1/analyze`
   - Validate image format/size (max 10MB, JPEG/PNG/WebP)
   - Extract CLIP embedding (512-dim vector)
   - Query pgvector: `embedding <=> query_embedding` (cosine distance)
   - Return top N matches with similarity scores
3. **Frontend**: Display results in `ResultsView`, cache in history

### Embedding Pre-computation

The system pre-computes embeddings for all ~1025 Pokémon during setup:

```bash
cd backend
poetry run python scripts/precompute_embeddings.py
```

This script:
1. Fetches all Pokémon from PokéAPI
2. Downloads official artwork images
3. Extracts CLIP embeddings for each
4. Stores in `pokemon.embedding` column
5. Takes ~15-30 minutes, run once per deployment

### Testing Strategy

**Backend Tests:**
- **Unit Tests**: Mock CLIP model, PokéAPI, database
  - `tests/unit/test_image_processor.py` - Image validation, CLIP mocking
  - `tests/unit/test_pokemon_matcher.py` - Cosine similarity logic
  - `tests/unit/test_pokedex_repository.py` - Data access layer
- **Integration Tests**: Use TestClient with in-memory fallback data
  - `tests/integration/test_analyze.py` - Full API flow without DB
  - `tests/integration/test_analyze_pgvector.py` - Full stack with real DB (requires `PGVECTOR_TESTS=1`)

**Frontend Tests:**
- `@testing-library/react` for component testing
- `vitest` as test runner
- Located in `frontend/src/components/__tests__/`

## Development Tips

### Adding a New Pokémon Endpoint

1. **Define Pydantic schema** in `app/models/api_models.py`
2. **Create route** in `app/api/routes/pokemon.py`
3. **Write tests first** in `tests/integration/test_pokemon.py`
4. **Implement repository method** in `app/repositories/pokedex_repository.py`
5. **Register router** in `app/main.py` (likely already done)

### Debugging CLIP Model Issues

- Model cached in `~/.cache/huggingface/`
- First load downloads ~600MB
- CPU inference: ~500ms, GPU: ~50ms
- Mock in tests: `@patch('app.services.image_processor.CLIPModel')`

### Database Migrations

```bash
cd backend

# Create new migration
poetry run alembic revision --autogenerate -m "description"

# Apply migrations
poetry run alembic upgrade head

# Rollback
poetry run alembic downgrade -1
```

### Frontend Component Development

- Run frontend dev server with hot reload: `bun run dev`
- API calls proxied to `http://localhost:8000` (configured in `vite.config.ts`)
- Use `ImageWithFallback` component for Pokémon sprites (handles broken URLs)

## Common Issues

### Backend won't start
- Check Python version: `python --version` (need 3.11+)
- Verify Poetry env: `cd backend && poetry env info`
- Missing deps: `poetry install --no-root`

### Frontend build errors
- Clear cache: `rm -rf frontend/node_modules && bun install`
- Check Bun version: `bun --version` (need 1.2+)

### pgvector tests failing
- Ensure DB is seeded: `poetry run python scripts/seed_pokemon_data.py`
- Embeddings computed: `poetry run python scripts/precompute_embeddings.py`
- Set environment variable: `PGVECTOR_TESTS=1 make analyze-pgvector`

### CLIP model not loading
- Check disk space (~600MB needed)
- Clear cache: `rm -rf ~/.cache/huggingface/`
- Re-run: Will auto-download on next startup

## API Documentation

When backend is running, visit:
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## Environment Variables

**Backend** (create `backend/.env`):
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/pokedex
API_PREFIX=/api/v1
ALLOWED_ORIGINS=http://localhost:5173
MAX_IMAGE_SIZE_MB=10
RATE_LIMIT_PER_MINUTE=10
```

**Frontend** (create `frontend/.env`):
```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Production Deployment Notes

- Backend: Docker container with pre-downloaded CLIP model
- Frontend: Static build deployed to Vercel/Netlify
- Database: Managed PostgreSQL with pgvector extension (Supabase/Neon)
- Embeddings: Pre-computed during deployment or as separate job
- Cost: ~$1-36/month for prototype scale

See `docs/deployment-guide.md` for full production setup.
