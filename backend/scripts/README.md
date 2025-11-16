# Backend Scripts

- `seed_pokemon_data.py`: Download Pokémon metadata from PokéAPI and store it in the database. Example:
  ```bash
  poetry run python scripts/seed_pokemon_data.py --limit 50
  ```
- `precompute_embeddings.py`: Download artwork and pre-compute CLIP embeddings for each Pokémon record:
  ```bash
  poetry run python scripts/precompute_embeddings.py
  ```

Run `poetry run alembic upgrade head` before executing these scripts to ensure the schema is ready. The `--limit` flag lets you test the workflow with a subset of the Pokédex.
