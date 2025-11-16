# Development Setup Guide

This guide explains how to reproduce the local environment required for the Pokémon Vision stack.

## Prerequisites
- Python 3.11+
- [Poetry](https://python-poetry.org/docs/#installation)
- Node.js 20+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Docker (for Postgres + pgvector, optional during Phase 0)

## Bootstrapping
1. Clone this repository.
2. Run `make bootstrap` from the repo root to install backend, frontend, and mobile dependencies.
3. Copy `.env.example` (coming soon) into `.env` files for each project and fill in secrets.

## Running Services
- `make backend-dev`: Starts FastAPI with reload at `http://localhost:8000`.
- `make frontend-dev`: Starts Vite dev server with React app (`http://localhost:5173`).
- `make mobile-dev`: Launches Expo for the iOS/Android preview.

## Testing
- `make backend-test`
- `make frontend-test`
- `make mobile-test`

## Pokémon Assets
Metadata and artwork URLs are pulled from PokéAPI (`https://pokeapi.co/api/v2`).
During development the backend loads a lightweight cache (`backend/app/data/pokemon_seed.json`)
containing official artwork URLs hosted on PokéAPI's GitHub CDN. Update or regenerate this
seed file as the synchronization scripts are implemented in later phases.

Update this file as deeper implementation details land (database migrations, seed scripts, etc.).
