.PHONY: install run test clean build deploy

install:
	pip install -r backend/requirements.txt

run:
	cd backend && uvicorn app.main:app --reload

test:
	pytest backend/

clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

build:
	docker-compose -f docker-compose.dev.yml build

deploy:
	docker-compose -f docker-compose.prod.yml up -d

stop:
	docker-compose down

migrate:
	cd backend && python create_tables.py

lint:
	flake8 backend/

format:
	black backend/
