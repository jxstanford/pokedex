
# Pokémon Vision Web (Rotom UI)

Rotom-phone inspired frontend that mirrors the `design/figma-make` experience and talks to the FastAPI backend.

## Prerequisites
- Bun 1.2.x
- Node 20+ (for tooling compatibility)

## Setup
```bash
bun install
```

## Development
```bash
# Start Vite dev server (http://localhost:5173)
bun run dev
```

## Tests
```bash
bun run test
```

## Build
```bash
bun run build
```

## API Configuration
- `VITE_API_BASE_URL` (optional): defaults to relative `/api/v1`. Set to your backend origin if running separately, e.g. `http://localhost:8000/api/v1`.

## Features
- Camera capture and file upload with client-side MIME/10MB validation and preview.
- Analyze flow calls `/api/v1/analyze` and renders top matches.
- Pokémon detail drawer fetches `/api/v1/pokemon/{id}` on demand.
- Recent analyses persisted to `localStorage` (preview + top match).
  
