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
├── frontend/          # React TypeScript SPA (web)
├── mobile/            # React Native + Expo Android app
├── backend/           # Django REST API
├── docs/              # Documentation pages
│   ├── DOCUMENTATION.md # Full app documentation
│   └── HOSTING.md     # Step-by-step hosting guide
├── ARCHITECTURE.md    # Full specification
└── README.md
```

## Prerequisites

- **Node.js** 18+ and **npm** (for the frontend)
- **Python** 3.10+ and **pip** (for the backend)
- **PostgreSQL** (optional; SQLite works for development)
- **Redis** (optional; required for Celery tasks)

## Vipengele (Web App)

| Ukurasa | Kazi | Nani anaweza kuhariri |
|---------|------|------------------------|
| Dashboard | Takwimu halisi, grafu ya matoleo kwa mwezi, shughuli za karibuni, hatua za kuanza | — |
| Jimbo / Mitaa | Kusajili, kuhariri, kuondoa | Jimbo Admin+ |
| Makanisa | Kusajili, kutafuta, kuchuja kwa mtaa | Mtaa Leader+ (mtaa wake tu) |
| Uinjilisti | Taarifa za kila mwezi kwa kanisa (moja kwa kila mwezi) | Church Leader+ (kanisa lake tu) |
| Matoleo | Kiasi + mgawanyo wa Kanisa/Jimbo unaohesabiwa kiotomatiki | Church Leader+ (kanisa lake tu) |
| Ripoti | Ripoti rasmi ya Jimbo/Mtaa/Kanisa kwa mwezi au mwaka; Print/PDF na CSV | wote |
| Watumiaji | Kuunda akaunti, role, nenosiri, kuzima akaunti | Super Admin |
| Kumbukumbu (Audit) | Nani alifanya nini, lini, IP na location | Jimbo Admin+ (kusoma) |
| Mipangilio | Aina za matoleo na asilimia za mgawanyo | Jimbo Admin+ |
| Wasifu | Kubadilisha nenosiri, kuwasha/kuzima location | wote |

Viewer anaweza kusoma tu. Kuondoa Mtaa/Kanisa/Mtumiaji ni *soft delete* (data haipotei).

## Kuendesha App Nzima kwa Server Moja (Windows)

Django inahudumia frontend iliyojengwa (`frontend/dist`) na API kwenye URL moja:

```powershell
cd frontend; npm install; npm run build
cd ..\backend
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py collectstatic --no-input
.\venv\Scripts\waitress-serve.exe --listen=127.0.0.1:8000 backend.wsgi:application
```

Fungua `http://127.0.0.1:8000`. Kupata link ya HTTPS ya kujaribu kwenye simu (ya muda, inafanya kazi kompyuta ikiwa imewashwa):

```powershell
cloudflared tunnel --url http://127.0.0.1:8000
```

## Demo (SQLite yenye data)

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File .\run_demo.ps1
```

Inatumia `backend/demo.sqlite3` (Mitaa 3, Makanisa 8, taarifa za miezi 12) na akaunti
`demo_admin`, `demo_jimbo`, `demo_mtaa`, `demo_kanisa`, `demo_viewer` — nenosiri `Demo@2026`.
Kwenye APK: **Login → Server → `IP-ya-kompyuta:8010`**. Maelezo kamili: `docs/DOCUMENTATION.md` sehemu ya 10.

## Development Quick Start

### Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173` (Vite inapeleka `/api` kwa backend iliyo `127.0.0.1:8000`).

### Mobile (Android)

```bash
cd mobile
npm install
npx expo start
```

Bonyeza `a` ili kuendesha kwenye Android emulator. Kuunda APK ya testing:

```bash
npm install -g eas-cli
eas build -p android --profile preview
```

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
python manage.py test core
```

Majaribio (`backend/core/tests.py`) yanahakiki login, usajili wa Jimbo→Mtaa→Kanisa, mgawanyo wa matoleo, ruhusa za kila role, soft delete na ripoti.

> **Kumbuka:** Kwenye kompyuta hii PostgreSQL haijasakinishwa, hivyo `backend/.env` inatumia SQLite (`backend/db.sqlite3`). Nenosiri la Postgres lenye `@` liandikwe `%40` ndani ya `DATABASE_URL`.

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

## Deployment (Test Server)

Backend inaweza kuhifadhiwa kwenye **Render** bila malipo:

1. Sajili akaunti kwenye [render.com](https://render.com)
2. Unda **Blueprint** kutoka `backend/render.yaml`
3. Render itaanzisha:
   - Web service ya Django
   - PostgreSQL database ya bila malipo
4. Hakikisha `DATABASE_URL`, `SECRET_KEY`, na `ALLOWED_HOSTS zimesetwa
5. Baada ya deploy, API itapatikana kwenye `https://yesaya-ministry-api.onrender.com/api`

Pia unaweza kutumia `build.sh` kwa build scripts:

```bash
cd backend
chmod +x build.sh
```

## Phases

1. UI/UX Design & Frontend Shell
2. Core Modules (Mitaa, Churches, Evangelism, Offerings)
3. Reporting & PDF Export
4. Users, Roles, Audit Logs
5. Backup, Notifications, Deployment

## License

Internal use only.
