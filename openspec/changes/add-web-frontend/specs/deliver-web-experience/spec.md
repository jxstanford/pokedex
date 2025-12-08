## ADDED Requirements
### Requirement: Rotom-inspired web shell
The web client SHALL present the Rotom-phone themed shell from `design/figma-make`, defaulting to a home view with entry points for camera, upload, results, and history; it MUST render responsively on mobile and desktop without breaking layout.

#### Scenario: Home view loads on mobile and desktop
- **WHEN** a user opens the site on a phone-sized viewport or a desktop browser
- **THEN** the Rotom shell layout is visible with navigation to camera/upload/history and no clipped content

### Requirement: Image capture and upload
The client SHALL support both file upload and camera capture via `<input type="file" accept="image/*" capture>`; it MUST enforce JPEG/PNG/WebP and a 10MB limit client-side, showing inline errors and blocking submission when invalid; a preview of the selected image MUST be shown before analysis.

#### Scenario: Invalid upload rejected
- **WHEN** a user selects a 12MB PDF
- **THEN** the UI displays an error about unsupported type/size and disables the analyze action

#### Scenario: Camera capture previewed
- **WHEN** a user taps the camera option on mobile and takes a photo
- **THEN** the captured image preview appears and the analyze action becomes available

### Requirement: Analyze request handling
When the user submits an image, the client SHALL POST multipart form data to `${API_BASE}/api/v1/analyze` with fields `image` and `top_n` (default 5, within 1–10); the analyzing state MUST show progress, and failures (HTTP/network) MUST surface an error message while keeping the selected image for retry; API base MUST be configurable via environment (e.g., `VITE_API_BASE_URL`) with a default of relative `/api/v1`.

#### Scenario: Successful analysis returns top matches
- **WHEN** a valid image is submitted without specifying `top_n`
- **THEN** the client requests `/api/v1/analyze` with `top_n=5` and renders the returned matches sorted by similarity descending

#### Scenario: Analyze failure is communicated
- **WHEN** the analyze request returns 429 or times out
- **THEN** the UI shows an error state with retry guidance and does not clear the pending image

### Requirement: Match results presentation
After a successful analysis, the client SHALL display each match with name, types, similarity percentage (score × 100%), and artwork, using a fallback sprite if the provided image URL fails; selecting a match MUST open the detailed view.

#### Scenario: Matches rendered with similarity and types
- **WHEN** the API returns three matches with scores 0.92, 0.85, 0.80
- **THEN** the UI shows them in that order with 92%/85%/80% badges and their type chips

### Requirement: Pokémon detail drawer
Selecting a match SHALL fetch `/api/v1/pokemon/{id}` and render description, generation, abilities, and base stats; the detail view MUST be dismissible and show an inline error if the fetch fails.

#### Scenario: Detail view shows metadata
- **WHEN** a user opens a match detail for Pokémon 6
- **THEN** the UI displays name, description, types, generation, abilities, and stats (HP/Attack/Defense/Sp. Atk/Sp. Def/Speed)

### Requirement: Recent analysis history
The client SHALL maintain a recent analyses list (at least five entries) persisted in local storage with Pokémon name, timestamp, and preview image when available; selecting a history entry MUST restore its results view.

#### Scenario: History persists across reload
- **WHEN** the user completes two analyses and reloads the page
- **THEN** the history view lists both analyses with timestamps and selecting one returns to its results

### Requirement: Bun-first frontend tooling
The frontend SHALL run with Bun commands: `bun install` to set up dependencies, `bun dev` for the Vite dev server, `bun test` for unit/component tests, and `bun build` for production assets; repo docs/Makefile MUST reference these commands.

#### Scenario: Bun dev server runs
- **WHEN** a developer runs `bun dev` in `frontend/`
- **THEN** the Vite dev server starts successfully and serves the Rotom web app
