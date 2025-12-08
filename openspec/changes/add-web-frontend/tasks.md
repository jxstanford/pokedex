## 1. Implementation
- [x] 1.1 Scaffold Bun + Vite + React TS app in `frontend/` (scripts: `bun install`, `bun dev`, `bun build`, `bun test`).
- [x] 1.2 Port the Rotom-shell UI from `design/figma-make` (home, camera/upload entry points, results deck, history) with responsive styling.
- [x] 1.3 Add API client layer for POST `/api/v1/analyze` (multipart, `top_n` control) and GET `/api/v1/pokemon/{id}`, with loading/error handling and offline fallback copy.
- [x] 1.4 Implement image validation (MIME, 10MB) and camera/upload flows with preview before submission.
- [x] 1.5 Render match results cards (name, types, similarity %, artwork) and a detail drawer/modal showing stats/metadata pulled from the Pokémon endpoint.
- [x] 1.6 Persist recent analyses locally (in-memory + localStorage) and surface a history list as in the design.
- [x] 1.7 Add tests for API layer and key components; wire linting/formatting if needed to match repo conventions.
- [x] 1.8 Update docs/Makefile scripts to reference Bun frontend commands.
