.PHONY: dev seed train test test-unit build docker-up docker-down

dev:
	docker compose up --build

seed:
	python scripts/seed.py

train:
	python scripts/generate_harvest_data.py

test:
	python -m pytest apps/api/tests -v

build:
	cd apps/web && npm run build

docker-up:
	docker compose up -d

docker-down:
	docker compose down
