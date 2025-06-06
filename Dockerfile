# Dockerfile
FROM python:3.13-slim

# Install system dependencies
# RUN apt-get update && apt-get install -y \
#     ffmpeg \
#     libmagic1 \
#     postgresql-client \
#     && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set working directory
WORKDIR /app

# Install dependencies
#RUN uv pip install --system -r pyproject.toml
# RUN uv venv .venv && uv pip install --upgrade pip && uv sync --python .venv/bin/python


# RUN uv sync --frozen --no-cache
# ENV PATH="/app/.venv/bin:$PATH"

# Copy application code
COPY . .
# COPY pyproject.toml uv.lock ./

# Create non-root user
# RUN useradd --create-home --shell /bin/bash app
# USER app

# Expose port
# EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
# CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
RUN uv sync --frozen --no-cache
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000

# Run the app
# CMD ["uv", "run", "main.py"]
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]