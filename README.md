# LMS - Library Management System

A full-stack web application built with Django backend, React frontend, PostgreSQL database, and Redis caching.

## Tech Stack

- Django 4.2 + Django REST Framework
- React 18 + JavaScript
- Python 3.12
- PostgreSQL 15
- Redis 7
- Docker & Docker Compose

## Project Structure

```
lms/
├── config/              # Django configuration
├── library/             # Django app
├── library-ui/          # React frontend
├── compose/             # Docker files and .env
├── local.yml            # Docker Compose
├── Makefile
└── manage.py
```

## Quick Start

1. **Setup:**
   ```bash
   cd /Users/makarand/workspace/interview/assignments/lms
   ```

2. **Build and Start:**
   ```bash
   make build
   make up
   ```

3. **Run Migrations:**
   ```bash
   make migrate
   ```

4. **Create Superuser:**
   ```bash
   make createsuperuser
   ```

5. **Access Application:**
   - Frontend: http://localhost:3000
   - Django Admin: http://localhost:8000/admin
   - API: http://localhost:8000/api/

## Available Commands

```bash
make build              # Build Docker images
make up                 # Start services
make down               # Stop services
make logs               # View logs
make migrate            # Run migrations
make createsuperuser    # Create admin user
make shell              # Django shell
```

## API Endpoints

- `GET /api/health/` - Health check
- `GET /api/books/` - List books
- `POST /api/books/` - Create book
- `GET /api/reservations/` - List reservations
- `POST /api/reservations/` - Create reservation

## Services

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Database: PostgreSQL on 5432
- Cache: Redis on 6379
