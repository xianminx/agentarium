# Deployment Guide - Agentarium

This guide covers deploying Agentarium to production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Docker Deployment](#docker-deployment)
- [Celery Workers](#celery-workers)
- [Database Setup](#database-setup)
- [SSL & HTTPS](#ssl--https)
- [Monitoring](#monitoring)
- [Backup & Recovery](#backup--recovery)

## Prerequisites

### Required Services
- **PostgreSQL 15+** - Production database
- **Redis 7+** - Caching & message broker
- **Docker & Docker Compose** (recommended) OR
- **Linux server** with Python 3.12+ and Node.js 20+

### Domain & SSL
- Domain name pointed to your server
- SSL certificate (use Let's Encrypt certbot)

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url> /opt/agentarium
cd /opt/agentarium
```

### 2. Configure Environment Variables

```bash
cd backend
cp .env.example .env
nano .env  # Edit configuration
```

**Critical Settings:**

```bash
# Generate new secret key
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Update .env
DJANGO_SECRET_KEY=<generated-key>
DJANGO_SETTINGS_MODULE=config.settings.prod
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DEBUG=False

# Database
DATABASE_URL=postgresql://user:password@db:5432/agentarium

# Redis
REDIS_URL=redis://redis:6379/1

# OpenAI
OPENAI_API_KEY=sk-your-api-key

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com
```

## Docker Deployment

### 1. Build Images

```bash
cd /opt/agentarium

# Build all services
docker-compose -f docker-compose.yml build
```

### 2. Initialize Database

```bash
# Run migrations
docker-compose run --rm web python manage.py migrate

# Create superuser
docker-compose run --rm web python manage.py createsuperuser

# Collect static files
docker-compose run --rm web python manage.py collectstatic --noinput

# (Optional) Load seed data
docker-compose run --rm web python manage.py seed
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f web

# Check service status
docker-compose ps
```

### 4. Verify Deployment

```bash
# Check web service
curl http://localhost:8000/admin/

# Check Celery worker
docker-compose logs celery_worker

# Check Redis
docker-compose exec redis redis-cli ping
```

## Celery Workers

### Starting Workers

**With Docker Compose** (Recommended):
```bash
# Already configured in docker-compose.yml
# Workers start automatically with:
docker-compose up -d
```

**Manual Start** (without Docker):
```bash
cd backend

# Start worker
celery -A config worker --loglevel=info --concurrency=2 &

# Start beat scheduler (for periodic tasks)
celery -A config beat --loglevel=info &

# Or use systemd (recommended for production)
```

### Systemd Service (Linux)

Create `/etc/systemd/system/celery.service`:

```ini
[Unit]
Description=Celery Worker for Agentarium
After=network.target redis.service

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/opt/agentarium/backend
Environment="PATH=/opt/agentarium/backend/.venv/bin"
ExecStart=/opt/agentarium/backend/.venv/bin/celery -A config worker --loglevel=info --concurrency=2 --detach
ExecStop=/opt/agentarium/backend/.venv/bin/celery -A config control shutdown
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable celery
sudo systemctl start celery
sudo systemctl status celery
```

### Monitoring Celery

```bash
# View active tasks
celery -A config inspect active

# View registered tasks
celery -A config inspect registered

# View worker stats
celery -A config inspect stats

# Purge all tasks
celery -A config purge
```

## Database Setup

### PostgreSQL Production Setup

**1. Install PostgreSQL:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**2. Create Database:**
```bash
sudo -u postgres psql

CREATE DATABASE agentarium;
CREATE USER agentarium_user WITH PASSWORD 'strong_password';
ALTER ROLE agentarium_user SET client_encoding TO 'utf8';
ALTER ROLE agentarium_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE agentarium_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE agentarium TO agentarium_user;
\q
```

**3. Update DATABASE_URL:**
```bash
DATABASE_URL=postgresql://agentarium_user:strong_password@localhost:5432/agentarium
```

### Database Migrations

```bash
# Run migrations
python manage.py migrate

# Check migration status
python manage.py showmigrations

# Create new migration
python manage.py makemigrations

# Rollback migration
python manage.py migrate app_name migration_name
```

## SSL & HTTPS

### Using Let's Encrypt (Certbot)

**1. Install Certbot:**
```bash
sudo apt-get install certbot python3-certbot-nginx
```

**2. Obtain Certificate:**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**3. Auto-renewal:**
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot auto-renewal is configured via systemd timer
sudo systemctl status certbot.timer
```

### Nginx Configuration

Create `/etc/nginx/sites-available/agentarium`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend (React)
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /opt/agentarium/backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /opt/agentarium/backend/media/;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/agentarium /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Monitoring

### Application Monitoring

**1. Sentry Integration:**

Install SDK:
```bash
cd backend
uv pip install sentry-sdk
```

Add to `.env`:
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
ENVIRONMENT=production
```

**2. Log Monitoring:**

View logs:
```bash
# Django logs
tail -f /opt/agentarium/backend/logs/django.log

# Docker logs
docker-compose logs -f web
docker-compose logs -f celery_worker

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

**3. System Monitoring:**

```bash
# Check disk space
df -h

# Check memory
free -h

# Check PostgreSQL connections
psql -U agentarium_user -d agentarium -c "SELECT count(*) FROM pg_stat_activity;"

# Check Redis memory
redis-cli info memory
```

### Health Checks

```bash
# Django health check
curl https://yourdomain.com/admin/

# API health check
curl https://yourdomain.com/api/agents/

# Celery health check
celery -A config inspect ping
```

## Backup & Recovery

### Database Backups

**1. Manual Backup:**
```bash
# Backup database
docker-compose exec db pg_dump -U postgres agentarium > backup_$(date +%Y%m%d_%H%M%S).sql

# Or without Docker
pg_dump -U agentarium_user agentarium > backup.sql
```

**2. Automated Backups (Cron):**

Create `/etc/cron.daily/backup-agentarium`:
```bash
#!/bin/bash
BACKUP_DIR=/opt/backups/agentarium
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose -f /opt/agentarium/docker-compose.yml exec -T db pg_dump -U postgres agentarium | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /opt/agentarium/backend/media/

# Delete backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
```

Make executable:
```bash
sudo chmod +x /etc/cron.daily/backup-agentarium
```

**3. Restore Database:**
```bash
# Stop services
docker-compose down

# Restore database
docker-compose up -d db
docker-compose exec -T db psql -U postgres agentarium < backup.sql

# Restart services
docker-compose up -d
```

### Configuration Backups

```bash
# Backup .env file
cp backend/.env backend/.env.backup

# Backup docker-compose.yml
cp docker-compose.yml docker-compose.yml.backup
```

## Scaling

### Horizontal Scaling

**Add more Celery workers:**
```bash
# Scale workers
docker-compose up -d --scale celery_worker=4
```

**Load Balancing:**
- Use Nginx for load balancing across multiple web instances
- Use Redis Sentinel for high-availability Redis
- Use PostgreSQL replication for read replicas

### Vertical Scaling

**Increase worker concurrency:**
```bash
# Edit docker-compose.yml
celery -A config worker --loglevel=info --concurrency=4
```

**Increase database connections:**
```bash
# Edit PostgreSQL postgresql.conf
max_connections = 200
```

## Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS
- [ ] Use HTTPS with SSL certificates
- [ ] Set secure cookie flags
- [ ] Configure CORS properly
- [ ] Use strong database passwords
- [ ] Enable PostgreSQL SSL
- [ ] Configure firewall (ufw)
- [ ] Keep dependencies updated
- [ ] Regular security audits
- [ ] Enable fail2ban for SSH
- [ ] Backup encryption

## Troubleshooting

### Web Service Not Starting
```bash
# Check logs
docker-compose logs web

# Check port availability
sudo netstat -tulpn | grep 8000

# Verify environment variables
docker-compose exec web env | grep DJANGO
```

### Database Connection Errors
```bash
# Test database connection
docker-compose exec web python manage.py dbshell

# Check PostgreSQL status
docker-compose exec db pg_isready
```

### Celery Tasks Failing
```bash
# Check worker logs
docker-compose logs celery_worker

# Inspect active tasks
celery -A config inspect active

# Purge failed tasks
celery -A config purge
```

## Support

For deployment issues:
- Documentation: [docs-url]
- GitHub Issues: [repository-url]/issues
- Email: devops@agentarium.io
