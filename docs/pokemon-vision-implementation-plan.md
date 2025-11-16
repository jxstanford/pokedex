# Pokémon Vision Implementation Plan

## Objectives & Scope
- Deliver the Pokémon visual recognition experience described in `docs/pokemon-vision-spec.md`, covering anonymous image analysis, Pokédex enrichment, and responsive clients.
- Adhere to success criteria in §1 (sub-5s response, 100 concurrent users, mobile-ready web app, future iOS support) and non-functional requirements in §2 (security, reliability, accessibility, maintainability).
- Follow the London-style TDD approach and directory conventions from Appendix A.

## Assumptions & External Dependencies
- PostgreSQL 15+ with pgvector, provisioned before backend work that depends on similarity search (§4).
- PokéAPI availability (rate limits are generous but cache locally to respect usage, per §4 Data Source).
- CLIP model weights (`openai/clip-vit-base-patch32`) available locally; GPU optional but recommended for embedding pre-computation (§4 Vision Model).
- Anonymous usage means no auth/identity integrations for MVP; images are discarded after processing (§2 Security).

## Phase 0 – Foundations (Prep / Day 0)
1. **Repository scaffolding**: Recreate the backend/frontend/mobile/doc structure from Appendix A; initialize toolchains (uv, npm, Expo) with pinned versions from Appendix B.
2. **Dev environment automation**: Provide `Makefile`/scripts for setup, linting, testing, and running services in Docker (Appendix A & §8).
3. **CI baseline**: Configure lint + test workflows (GitHub Actions) for backend (ruff, pytest) and frontend (ESLint, Vitest).
4. **Documentation stubs**: Create `docs/development-setup.md`, `docs/api-documentation.md`, `docs/deployment-guide.md` placeholders so future updates have a home (§2 Maintainability).

Exit criteria: reproducible dev environment and CI green on empty skeleton.

## Phase 1 – Backend Platform (Weeks 1-2)
### 1. Environment & Config
- Define typed FastAPI settings via `pydantic-settings`; load secrets via env vars (§2 Security).
- Wire structured logging utilities with request IDs, latency, and error context (§2 Reliability).

### 2. Database Layer
- Write Alembic migrations for the schema in §4 Database, including `pokemon`, `analysis_requests`, and pgvector indexes.
- Implement database module with async SQLAlchemy/asyncpg pool management and health checks.

### 3. Pokédex Data Ingestion
- Build `PokedexRepository` with async HTTPX client + caching: fetch from PokéAPI, normalize entities into domain models (§3 Core Entities).
- Add seeding script to populate metadata tables (`scripts/seed_pokemon_data.py`).

### 4. Image Processing Service
- Implement `ImageProcessor` methods per §3 Domain Services: MIME/type validation, 10MB limit, resizing to 224x224 (Pillow), CLIP embedding extraction + L2 normalization.
- Abstract CLIP model loading (lazy singleton) to meet performance budget (<500ms inference on CPU per §2 Performance).

### 5. Matching Service & Vector Search
- Implement `PokemonMatcher` orchestrating pgvector similarity search, fallback cosine calculations if DB unavailable.
- Add stored procedure (`find_similar_pokemon`) from §7; expose repository helpers returning `(pokemon, similarity)` tuples ranked descending.

### 6. API Layer & Middleware
- Build FastAPI routers for:
  - `POST /api/v1/analyze`: multipart uploads, `top_n` validation (<=10), error taxonomy from §5.
  - `GET /api/v1/pokemon/{id}`: fetch metadata, handle 404.
  - `GET /api/v1/health`: surface DB/model status, counts (§5).
- Implement middleware for rate limiting (10 req/IP/min), request timing, exception mapping, and CORS settings (§2 Security).
- Ensure user images are processed in-memory and never persisted (§2 Security/Data Privacy).

### 7. Observability & Ops
- Emit metrics for inference time, DB latency, match scores; expose Prometheus-friendly endpoint or integrate with a hosted service (§2 Reliability).
- Add structured audit logging to `analysis_requests` table for analytics (optional per schema).

### 8. Testing & Quality Gates
- Unit tests for services and repositories following §6 examples (pytest + mocks).
- Integration tests using FastAPI `TestClient` and temporary Postgres/pgvector container; include rate-limit & file size scenarios.
- Load-test `/analyze` using k6/Locust scripts to validate 100 concurrent users + <5s processing time.

### Phase 1 Exit Criteria
- All backend endpoints functional with >90% unit test coverage for core services.
- Embedding similarity search returns top 5 matches within budget on representative hardware.
- Health endpoint reflects DB + model readiness; CI runs backend suite automatically.

## Phase 1b – Data Pre-computation & Tooling
1. Implement `scripts/precompute_embeddings.py` exactly as outlined in §7, but with resumable progress (store last processed ID) and failure logging.
2. Schedule job/manual run post-deployment to populate embeddings for all 1,025 Pokémon; verify counts via health endpoint.
3. Document re-run procedure when CLIP model version changes.

## Phase 2 – Web Frontend (Weeks 3-4)
### 1. Project Setup
- Initialize Vite + React + TS, Tailwind configuration, absolute imports, and React Router skeleton (Appendix A/B).
- Configure React Query client with base URL env var.

### 2. Core Features
- **CameraCapture**: MediaDevices API integration with permissions UX, capture/preview, error fallbacks (§1 US-001).
- **ImageUpload**: Drag/drop + file picker with size/MIME validation matching backend limits (§1 US-002).
- **Analysis Workflow**: `useAnalyze` hook orchestrating uploads, progress indicators, retries, error toasts, respect `top_n` UI control.
- **MatchResults & PokemonDetail**: Cards showing similarity %, types, description, CTA to detail view (§1 US-003/4).
- **Responsive Layout**: Tailwind breakpoints covering 320px mobile to desktop, align with §2 Accessibility.

### 3. State & Error Handling
- Centralize loading/error states, show skeletons, provide retry/resubmit actions; implement rate-limit messaging.
- Cache recent analyses client-side (React Query) for optimistic UX without persisting images.

### 4. Testing & Quality
- Component/unit tests via Testing Library + Vitest as sketched in §6 (CameraCapture, MatchResults, API hook).
- Cypress or Playwright smoke tests for upload/analyze flow across desktop + mobile viewport.
- Linting + type-check gating CI.

### 5. Deployment Prep
- Build-time config for API base URL, analytics toggles.
- Update `docs/deployment-guide.md` with frontend steps plus CDN caching guidance (§8 Deployment Checklist).

Exit criteria: PWA-like responsive app working against staging API, lighthouse accessibility score ≥ 90, automated tests green.

## Phase 3 – iOS App (Weeks 5-6, Optional)
- Bootstrap Expo project mirroring React component structure; reuse hooks/services where possible (§4 Mobile).
- Implement native camera/upload via `expo-camera` and `expo-image-picker`, with the same validation/error flows.
- Recreate MatchResults and detail screens with platform-appropriate navigation (React Navigation stack).
- Add end-to-end testing on simulators + at least one physical device; prepare TestFlight build per Appendix D timeline.

Exit criteria: Feature parity with web MVP, camera capture latency ≤ 2s on iPhone 12+, passes App Store review checklist.

## Cross-Cutting Concerns
- **Security**: Enforce size/type validation in both client and server, use signed URLs for static assets, rotate API keys, and document incident response (§2 Security).
- **Performance**: Profile CLIP inference (consider GPU toggle), enable CDN caching for Pokédex assets, compress responses (gzip/brotli), and implement background warm-up of CLIP model.
- **Accessibility**: Keyboard navigable UI, ARIA labels, color contrast tokens shared across web/mobile, provide text equivalents for similarity scores (§2 Accessibility).
- **Documentation**: Maintain OpenAPI docs, publish API examples (Appendix C) and troubleshooting tips in `docs/api-documentation.md`.

## Deployment & Operations
1. **Containerization**: Author Dockerfiles + docker-compose stack from §8, ensuring multi-stage builds (builder/runtime) and health checks.
2. **Environment Promotion**: Define dev/staging/prod configs, DB migrations per environment, and secrets management (e.g., Doppler/GitHub Actions secrets).
3. **Monitoring**: Hook health endpoint into uptime monitoring, forward logs to observability stack (e.g., Logtail), configure alerts for error rate >1% or latency >5s.
4. **Backups & DR**: Enable automated Postgres backups, document restore process.

## Risks & Mitigations
- **PokéAPI downtime**: Cache metadata locally; include manual CSV fallback for seed data.
- **CLIP performance on CPU**: Optionally provision GPU runners or quantize model; support asynchronous job queue if synchronous flow breaches SLA.
- **Rate limiting false positives**: Allow configurable thresholds per environment; add user messaging to encourage slower retries.
- **Mobile camera permissions**: Provide clear prompts/instructions and graceful degradation to file upload.

## Success Metrics & Validation
- Track `/analyze` latency percentiles, match accuracy feedback, and concurrency headroom (metrics from §11).
- Instrument frontend for engagement metrics (matches per session, drop-off during upload) to validate customer stories.

Delivering each phase in order—while keeping tests, docs, and ops in lockstep—ensures the implementation stays aligned with the comprehensive specification.
