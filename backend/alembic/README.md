# Database Migrations

This directory contains Alembic database migrations for the Toadoo application.

## Commands

### Create a new migration
```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "description of changes"
```

### Apply migrations
```bash
# Upgrade to latest version
alembic upgrade head

# Upgrade to specific version
alembic upgrade <revision_id>
```

### Rollback migrations
```bash
# Downgrade one version
alembic downgrade -1

# Downgrade to specific version
alembic downgrade <revision_id>
```

### View migration history
```bash
# Show current version
alembic current

# Show migration history
alembic history

# Show pending migrations
alembic history --verbose
```

## Migration Files

Migrations are stored in `versions/` directory with format:
`<revision_id>_<description>.py`

Each migration contains:
- `upgrade()` - Apply changes
- `downgrade()` - Revert changes

## Initial Setup

The initial migration creates all tables:
- `users` - User accounts
- `todos` - Todo items
- `refresh_tokens` - JWT refresh tokens
- `email_verification_tokens` - Email verification
- `password_reset_tokens` - Password reset
