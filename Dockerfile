# Dockerfile
FROM python:3.13-slim

# Install system dependencies
# RUN apt-get update && apt-get install -y \
#     ffmpeg \
#     postgresql-client \
#     && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set working directory
WORKDIR /app

# Copy application code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
RUN uv sync --frozen --no-cache
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000

# Run the app
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]