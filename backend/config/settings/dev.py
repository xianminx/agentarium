from .base import *

# Override secure cookie settings for local development
SESSION_COOKIE_SECURE = False  # Allow cookies over HTTP in development
CSRF_COOKIE_SECURE = False  # Allow CSRF cookies over HTTP in development

# Optional: Make admin more permissive in development
SESSION_COOKIE_SAMESITE = "Lax"  # Less strict than the default
CSRF_COOKIE_SAMESITE = "Lax"
