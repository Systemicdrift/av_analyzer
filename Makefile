# Makefile

VENV := .venv
PYTHON := $(VENV)/bin/python
UV := uv
PYTEST := $(VENV)/bin/pytest

.PHONY: help venv install test clean

help:
	@echo "Makefile commands:"
	@echo "  clean        - Remove virtual environment and __pycache__"
	@echo "  clean-build  - Build new docker images"
	@echo "  relock       - Build new uv.lock file"
	@echo "  setup-python - Setup venv, install python deps from pyproject.toml"
	@echo "  setup-all    - Setup docker containers and download llm model"
	@echo "  test         - Run pytest tests"
	@echo "  test-int     - Run pytest integration tests"

setup-python:
	uv sync

test:
	@echo "Running tests with pytest..."
	$(PYTEST) -m "not integration"

test-int:
	docker compose up --build --abort-on-container-exit --exit-code-from test_integration

clean:
	@echo "Removing virtual environment and __pycache__..."
	rm -rf $(VENV) **/__pycache__


relock:
	uv lock

clean-build:
	@echo "Building docker containers..."
	docker compose build --no-cache
	docker compose up

setup-llama:
	@echo "Downloading model..."
	docker exec -it av_analyzer-ollama-1 ollama pull llama3:8b

setup-all: clean-build