FROM python:3.11-slim

# System setup
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root user required by Hugging Face Spaces (UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONPATH=/home/user/app/apps/api \
    PORT=7860

WORKDIR $HOME/app

# Install dependencies first for Docker caching
COPY --chown=user apps/api/requirements.txt requirements.txt
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy application source
COPY --chown=user . $HOME/app

EXPOSE 7860

# Runs on PORT env var (7860 for HF Spaces, 8000 for Koyeb/standard)
CMD ["sh", "-c", "uvicorn app.main:app --app-dir apps/api --host 0.0.0.0 --port ${PORT:-7860}"]
