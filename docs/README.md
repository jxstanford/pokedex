# Pokémon Vision Documentation

## Available Guides
- `docs/pokemon-vision-spec.md`: Full product/technical specification
- `docs/development-setup.md`: Environment setup, migrations, seeding, and test commands
- `docs/deployment-guide.md`: High-level deployment checklist

## Running Tests
- `make analyze-test`: Lightweight integration test (in-memory fallback)
- `PGVECTOR_TESTS=1 make analyze-pgvector`: Full CLIP + pgvector flow (requires DB seeded + embeddings)

Keep docs up to date as new phases land.
