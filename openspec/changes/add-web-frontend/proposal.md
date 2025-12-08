# Change: Add Bun-based web frontend for Pokémon Vision

## Why
- No web frontend exists even though the Makefile/README reference one; users cannot upload or view matches without it.
- A Figma-derived prototype (`design/figma-make`) defines the intended Rotom-phone experience that should be realized and wired to the backend.
- We need a Bun-first setup to reduce JS dependency install times and match the requested toolchain.

## What Changes
- Scaffold a Bun + React + Vite TypeScript app under `frontend/` that mirrors the `design/figma-make` experience (Rotom shell, camera/upload, results, history).
- Integrate with the FastAPI backend: POST `/api/v1/analyze` for matches and GET `/api/v1/pokemon/{id}` for detail, with loading/error states and the 10MB/MIME limits enforced client-side.
- Add environment-based API configuration, image validation, and local recent-history persistence; ensure UI is responsive for mobile/desktop.
- Update repo scripts/docs (Makefile or README) for Bun workflows (`bun install/dev/test/build`).

## Impact
- Affected specs: `deliver-web-experience`
- Affected code: new `frontend/` app, Makefile/docs adjustments, possible shared types for API payloads.
