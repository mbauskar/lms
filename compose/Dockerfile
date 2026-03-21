FROM python:3.12-alpine

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apk add --no-cache \
    postgresql-client

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

COPY config/ ./config/
COPY library/ ./library/
COPY manage.py .

RUN chmod +x config/entry.sh
RUN ls -l config

ENTRYPOINT ["/bin/sh", "config/entry.sh"]
