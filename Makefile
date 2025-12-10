.PHONY: bootstrap backend-setup frontend-setup mobile-setup backend-dev frontend-dev mobile-dev backend-test frontend-test mobile-test lint clean stop restart start-backend start-frontend stop-backend stop-frontend backend-seed backend-embed

DEV_DIR := .devservers
BACKEND_PID := $(DEV_DIR)/backend.pid
FRONTEND_PID := $(DEV_DIR)/frontend.pid
BACKEND_LOG := $(DEV_DIR)/backend.log
FRONTEND_LOG := $(DEV_DIR)/frontend.log

bootstrap: backend-setup frontend-setup mobile-setup

backend-setup:
	cd backend && poetry install --no-root

frontend-setup:
	cd frontend && bun install

mobile-setup:
	cd mobile && npm install

backend-dev:
	cd backend && poetry run uvicorn app.main:app --reload

frontend-dev:
	cd frontend && bun run dev -- --host

mobile-dev:
	cd mobile && npx expo start --tunnel

backend-test:
	cd backend && poetry run pytest

analyze-test:
	cd backend && poetry run pytest tests/integration/test_analyze.py -k "returns_matches"

analyze-pgvector:
	cd backend && PGVECTOR_TESTS=1 poetry run pytest tests/integration/test_analyze_pgvector.py

frontend-test:
	cd frontend && bun run test -- --run

mobile-test:
	cd mobile && npm run test

lint:
	cd backend && poetry run ruff check . && poetry run mypy .
	cd frontend && bun run test -- --passWithNoTests
	cd mobile && npm run lint

clean:
	rm -rf backend/.mypy_cache backend/.pytest_cache frontend/node_modules mobile/node_modules frontend/dist mobile/dist

backend-seed:
	cd backend && poetry run python scripts/seed_pokemon_data.py

backend-embed:
	cd backend && poetry run python scripts/precompute_embeddings.py

start-backend:
	@mkdir -p $(DEV_DIR)
	@if [ -f $(BACKEND_PID) ] && kill -0 $$(cat $(BACKEND_PID)) 2>/dev/null; then \
		echo "backend dev server already running (pid $$(cat $(BACKEND_PID)))"; \
	else \
		echo "Starting backend dev server..."; \
		nohup sh -c 'cd backend && poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000' >$(BACKEND_LOG) 2>&1 & echo $$! > $(BACKEND_PID); \
		echo "backend dev server started (pid $$(cat $(BACKEND_PID)), log $(BACKEND_LOG))"; \
	fi

start-frontend:
	@mkdir -p $(DEV_DIR)
	@if [ -f $(FRONTEND_PID) ] && kill -0 $$(cat $(FRONTEND_PID)) 2>/dev/null; then \
		echo "frontend dev server already running (pid $$(cat $(FRONTEND_PID)))"; \
	else \
		echo "Starting frontend dev server..."; \
		nohup sh -c 'cd frontend && bun run dev' >$(FRONTEND_LOG) 2>&1 & echo $$! > $(FRONTEND_PID); \
		echo "frontend dev server started (pid $$(cat $(FRONTEND_PID)), log $(FRONTEND_LOG))"; \
		echo "Visit http://localhost:5173 once Vite reports the URL"; \
	fi

stop: stop-backend stop-frontend

stop-backend:
	@if [ -f $(BACKEND_PID) ]; then \
		pid=$$(cat $(BACKEND_PID)); \
		if kill -0 $$pid 2>/dev/null; then \
			echo "Stopping backend dev server (pid $$pid)..."; \
			kill $$pid; \
		else \
			echo "backend dev server not running (stale pid $$pid)"; \
		fi; \
		rm -f $(BACKEND_PID); \
	else \
		echo "backend dev server not running"; \
	fi

stop-frontend:
	@if [ -f $(FRONTEND_PID) ]; then \
		pid=$$(cat $(FRONTEND_PID)); \
		if kill -0 $$pid 2>/dev/null; then \
			echo "Stopping frontend dev server (pid $$pid)..."; \
			kill $$pid; \
		else \
			echo "frontend dev server not running (stale pid $$pid)"; \
		fi; \
		rm -f $(FRONTEND_PID); \
	else \
		echo "frontend dev server not running"; \
	fi

restart: stop start
