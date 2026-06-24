# YESAYA MINISTRY — Backend

Django REST API for the YESAYA MINISTRY MANAGEMENT SYSTEM.

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Core Endpoints

- `POST /api/auth/login/` — JWT login
- `POST /api/auth/refresh/` — Refresh token
- `GET/POST /api/users/` — User management
- `GET/POST /api/jimbo/` — Jimbo CRUD
- `GET/POST /api/mitaa/` — Mitaa CRUD
- `GET/POST /api/churches/` — Church CRUD
- `GET/POST /api/evangelism/` — Evangelism records
- `GET/POST /api/offering-types/` — Offering types
- `GET/POST /api/offerings/` — Offerings
- `GET /api/dashboard-stats/` — Dashboard summary
- `POST /api/change-password/` — Change password

## Role Hierarchy

- `super_admin` — Full access
- `jimbo_admin` — Jimbo, Mitaa, Churches, Offerings, Users
- `mtaa_leader` — Assigned Mtaa and its Churches
- `church_leader` — Assigned Church only
- `viewer` — Read only (not yet enforced in all viewsets)

## Database

Development uses SQLite by default. Set `DATABASE_URL` in `.env` to use PostgreSQL.

## Celery

```bash
celery -A backend worker -l info
celery -A backend beat -l info
```
