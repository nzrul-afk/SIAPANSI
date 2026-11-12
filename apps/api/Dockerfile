FROM python:3.11-slim

WORKDIR /workspace/apps/api

COPY apps/api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY data /workspace/data
COPY models /workspace/models
COPY scripts /workspace/scripts
COPY apps/api /workspace/apps/api

ENV PYTHONPATH=/workspace/apps/api
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
