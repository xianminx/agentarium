# Agentarium - Agent Workflow Dashboard

A production-ready web application for managing AI agents and executing tasks using OpenAI's API. Built with Django REST Framework (backend) and React 19 (frontend).

## Features

- **Agent Management**: Create, update, and delete AI agents with custom configurations
- **Task Execution**: Run tasks asynchronously using Celery workers
- **Real-time Updates**: Server-Sent Events (SSE) for live task status updates
- **Caching**: Redis-based caching for improved performance
- **Multi-tenant**: User isolation with permission-based access control
- **REST API**: Full REST API with pagination, filtering, and ordering
- **Docker Support**: Complete Docker setup for easy deployment
- **Test Coverage**: 78% backend test coverage with 62 passing tests

## Tech Stack

### Backend

- **Django 5.2.7** - Web framework
- **Django REST Framework** - REST API
- **Celery** - Async task processing
- **Redis** - Caching & message broker
- **PostgreSQL** - Production database (SQLite for dev)
- **OpenAI SDK** - AI agent execution (Gemini via OpenAI-compatible endpoint)
- **pytest** - Testing framework

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **TanStack Router** - File-based routing
- **TanStack Query** - Data fetching & caching
- **Shadcn/UI** - Component library
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- Redis (for caching & Celery)
- PostgreSQL (for production)
- pnpm (for frontend dependencies)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd agentarium
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment with uv
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
uv pip install -r pyproject.toml

# Copy environment file
cp .env.example .env
# Edit .env and set your GEMINI_API_KEY

# Run migrations
python manage.py migrate

# Load seed data (optional)
python manage.py seed

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will be available at <http://localhost:8000>

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Frontend will be available at <http://localhost:5173>

### 4. Start Redis (Required for Caching & Celery)

```bash
# macOS (with Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 5. Start Celery Worker (Optional - for async tasks)

```bash
cd backend

# Start Celery worker
celery -A config worker --loglevel=info

# Start Celery beat (for periodic tasks)
celery -A config beat --loglevel=info
```

## Running with Docker

### Development with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

Services:

- **Web (Django)**: <http://localhost:8000>
- **Frontend (React)**: <http://localhost:5173>
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

## API Endpoints

### Authentication

```
POST   /api/token/          # Obtain JWT token
POST   /api/token/refresh/  # Refresh JWT token
```

### Agents

```
GET    /api/agents/         # List agents (paginated, 20/page)
POST   /api/agents/         # Create agent
GET    /api/agents/{id}/    # Retrieve agent
PATCH  /api/agents/{id}/    # Update agent
DELETE /api/agents/{id}/    # Delete agent
```

### Tasks

```
GET    /api/tasks/          # List tasks (filterable by status, agent)
POST   /api/tasks/          # Create task
GET    /api/tasks/{id}/     # Retrieve task
POST   /api/tasks/run/      # Run task (async via Celery)
```

### Real-time

```
GET    /stream/tasks/       # Server-Sent Events for task updates
```

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=apps --cov=utils --cov-report=html

# Run specific test file
uv run pytest tests/test_agents_api.py

# Run in verbose mode
uv run pytest -v
```

**Test Coverage**: 78% (62 passing tests)

### Test Categories

- **API Tests**: Agent & Task CRUD operations
- **Model Tests**: Database models & relationships
- **Serializer Tests**: Data validation & serialization
- **Permission Tests**: Access control
- **Cache Tests**: Redis caching functionality
- **Integration Tests**: End-to-end workflows

## Code Quality

```bash
cd backend

# Format code with Black
uv run black .

# Check formatting
uv run black . --check

# Sort imports (if isort is installed)
uv run isort .

# Type checking (if mypy is installed)
uv run mypy .
```

## Project Structure

```
agentarium/
    backend/                    # Django backend
        apps/
            agents/            # Agent models & APIs
            tasks/             # Task execution & management
            core/              # Shared utilities
            users/             # User management
        config/                # Django settings
        tests/                 # Test suite
        fixtures/              # Seed data
        utils/                 # OpenAI client wrapper
        manage.py
        pyproject.toml
        Dockerfile
 
    frontend/                   # React frontend
        src/
            components/        # UI components
            pages/             # Route pages
            hooks/             # Custom React hooks
            layouts/           # Layout components
            lib/               # API client & utilities
        package.json
        Dockerfile
 
    docker-compose.yml          # Docker orchestration
    README.md
    DEPLOYMENT.md               # Production deployment guide
```

## Environment Variables

See `.env.example` for all available environment variables:

### Required

- `GEMINI_API_KEY` - Gemini API key for agent execution
- `DJANGO_SECRET_KEY` - Django secret key (generate new for production)

### Database

- `DATABASE_URL` - PostgreSQL connection string
- Or: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`

### Redis & Celery

- `REDIS_URL` - Redis connection string
- `CELERY_BROKER_URL` - Celery broker URL
- `CELERY_RESULT_BACKEND` - Celery result backend

### Security

- `DJANGO_ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS` - Comma-separated list of CORS origins
- `DEBUG` - Set to `False` in production

## Performance Optimization

### Backend

- **Caching**: Redis caching with per-user cache keys
- **Query Optimization**: `select_related()` and `prefetch_related()` for reduced DB queries
- **Pagination**: Limit-offset pagination (20 items/page)
- **Connection Pooling**: PostgreSQL connection pooling in production

### Frontend

- **Code Splitting**: Route-based lazy loading
- **Query Caching**: TanStack Query with 5-minute cache
- **Memoization**: React.memo for expensive components
- **Asset Optimization**: Vite build optimization

## Monitoring & Logging

### Development

- Django logs to console
- Celery logs to console

### Production

- Logs to files: `backend/logs/django.log`
- Rotating file handler (15MB per file, 10 backups)
- Optional Sentry integration for error tracking

## Common Tasks

### Reset Database

```bash
cd backend
python manage.py flush
python manage.py migrate
python manage.py seed
```

### Create New Migration

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Collect Static Files

```bash
cd backend
python manage.py collectstatic
```

### Access Django Admin

1. Create superuser: `python manage.py createsuperuser`
2. Visit: <http://localhost:8000/admin/>

## Troubleshooting

### Redis Connection Error

- Ensure Redis is running: `redis-cli ping` (should return "PONG")
- Check Redis URL in `.env`

### Celery Tasks Not Running

- Ensure Celery worker is running
- Check Celery logs for errors
- Verify Redis connection

### Gemini API Error

- Verify `GEMINI_API_KEY` is set in `.env`
- Check API key validity
- Review Gemini API rate limits

### CORS Errors

- Add frontend URL to `CORS_ALLOWED_ORIGINS` in settings
- Verify `CSRF_TRUSTED_ORIGINS` includes frontend domain

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Run tests: `pytest`
4. Format code: `black .`
5. Commit changes: `git commit -am 'Add feature'`
6. Push to branch: `git push origin feature/my-feature`
7. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions:

- GitHub Issues: [repository-url]/issues
- Documentation: [docs-url]
- Email: <support@agentarium.io>
