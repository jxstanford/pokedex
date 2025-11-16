.PHONY: bootstrap backend-setup frontend-setup mobile-setup backend-dev frontend-dev mobile-dev backend-test frontend-test mobile-test lint clean

bootstrap: backend-setup frontend-setup mobile-setup

backend-setup:
	cd backend && poetry install --no-root

frontend-setup:
	cd frontend && npm install

mobile-setup:
	cd mobile && npm install

backend-dev:
	cd backend && poetry run uvicorn app.main:app --reload

frontend-dev:
	cd frontend && npm run dev -- --host

mobile-dev:
	cd mobile && npx expo start --tunnel

backend-test:
	cd backend && poetry run pytest

frontend-test:
	cd frontend && npm run test -- --run

mobile-test:
	cd mobile && npm run test

lint:
	cd backend && poetry run ruff check . && poetry run mypy .
	cd frontend && npm run lint
	cd mobile && npm run lint

clean:
	rm -rf backend/.mypy_cache backend/.pytest_cache frontend/node_modules mobile/node_modules frontend/dist mobile/dist
