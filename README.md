# YESAYA MINISTRY MANAGEMENT SYSTEM v3.0

Enterprise-level church and ministry management system for managing Jimbo, Mitaa, Churches, Evangelism Data, Offerings, Financial Reports, Users and Organizational Reporting.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + ShadCN UI
- **State:** Redux Toolkit + React Hook Form + Zod
- **Routing:** React Router
- **Backend:** Django + Django REST Framework
- **Auth:** JWT (SimpleJWT)
- **Database:** PostgreSQL (production), SQLite (development)
- **Storage:** Supabase Storage (production)
- **Charts:** Recharts
- **PDF:** React PDF / ReportLab

## Project Structure

```
YESAYA MINISTRY/
├── frontend/          # React TypeScript SPA
├── backend/           # Django REST API
├── ARCHITECTURE.md    # Full specification
└── README.md
```

## Prerequisites

- **Node.js** 18+ and **npm** (for the frontend)
- **Python** 3.10+ and **pip** (for the backend)
- **PostgreSQL** (optional; SQLite works for development)
- **Redis** (optional; required for Celery tasks)

## Development Quick Start

### Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

### Backend

```bash
cd backend
copy .env.example .env
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_defaults
python manage.py createsuperuser
python manage.py runserver
```

API will be at `http://localhost:8000/api/`.

### Database Setup

The initial migration is included. To create the database tables:

```bash
cd backend
python manage.py migrate
```

If you ever change the models, regenerate migrations with:

```bash
python manage.py makemigrations
python manage.py migrate
```

After installing dependencies, run the validation checks:

```bash
python manage.py check
python manage.py test
```

## Default Admin

Create a superuser via `python manage.py createsuperuser`, then log in through the frontend.

## Location Tracking (Optional)

The system can record the user's latitude/longitude when:
- Logging in
- Creating/updating an Evangelism record
- Creating/updating an Offering

It is **optional**. Users can toggle "Tumia location" in the login form or via their profile. When disabled, records are saved without coordinates.

Captured coordinates are stored in:
- `User.last_login_latitude / last_login_longitude`
- `EvangelismRecord.latitude / longitude`
- `Offering.latitude / longitude`
- `AuditLog.latitude / longitude`

## Lint / Type Errors

If you see missing module errors in the IDE, run `npm install` in the `frontend` folder so the IDE can resolve dependencies.

## Phases

1. UI/UX Design & Frontend Shell
2. Core Modules (Mitaa, Churches, Evangelism, Offerings)
3. Reporting & PDF Export
4. Users, Roles, Audit Logs
5. Backup, Notifications, Deployment

## License

Internal use only.
