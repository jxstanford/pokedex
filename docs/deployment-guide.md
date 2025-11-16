# Deployment Guide

This guide will describe how to deploy the Pokémon Vision stack to staging and production environments.

## Checklist Summary
- Provision PostgreSQL + pgvector
- Run Alembic migrations (`poetry run alembic upgrade head`)
- Precompute Pokémon embeddings
- Deploy FastAPI backend
- Deploy React frontend to CDN
- Monitor health and logs

Detailed instructions per environment will be added during Phase 1+.
