# YESAYA MINISTRY MANAGEMENT SYSTEM — Architecture & Specification

## 1. Overview

YESAYA MINISTRY MANAGEMENT SYSTEM ni mfumo wa ndani wa usimamizi wa Jimbo, Mitaa na Makanisa. Mfumo unakusanya, kuhifadhi, kusimamia na kutoa taarifa mbalimbali za kiutawala, uinjilisti, matoleo na taarifa za kifedha.

## 2. Goals

- Secure
- Responsive
- Scalable
- Cloud Ready
- Multi User
- Enterprise Level

## 3. Tech Stack

### Frontend
- Language: TypeScript
- Framework: React.js
- UI: Tailwind CSS + ShadCN UI
- State: Redux Toolkit
- Routing: React Router
- Forms: React Hook Form
- Validation: Zod
- Charts: Recharts
- PDF Preview: React PDF

### Backend
- Language: Python
- Framework: Django
- API: Django REST Framework
- Authentication: JWT Authentication
- Security: Django Security Middleware
- Background Jobs: Celery
- Email: SMTP / SendGrid

### Database
- PostgreSQL

### File Storage
- Supabase Storage

## 4. Security Requirements

- JWT Authentication
- Role Based Access Control
- Audit Logs
- Activity Tracking
- IP Logging
- Device Tracking
- CSRF Protection
- XSS Protection
- SQL Injection Protection
- Rate Limiting

## 5. User Roles

1. Super Admin — Full System Access
2. Jimbo Admin — Manage Entire Field
3. Mtaa Leader — Manage Assigned Mtaa
4. Church Leader — Manage Assigned Church
5. Viewer — Read Only Access

## 6. Modules

- Dashboard
- Jimbo Information
- Mitaa Management
- Church Management
- Evangelism
- Offerings
- Reports
- Users
- Settings
- Audit Logs
- Profile

## 7. Offerings Split Rules

| Type | Church % | Field % |
|------|----------|---------|
| Zaka | 42 | 58 |
| Shukrani | 42 | 58 |
| Kambi | 0 | 100 |
| Ujenzi wa Jimbo | 0 | 100 |
| Majengo ya Kanisa | 100 | 0 |
| Custom | user-defined | auto (100 - church %) |

## 8. Deployment

- Frontend: Vercel
- Backend: Railway / Render
- Database: PostgreSQL
- Storage: Supabase Storage
- SSL: HTTPS
- CDN: Cloudflare
- Monitoring: Sentry
- Analytics: PostHog

## 9. Phases

1. UI/UX Design
2. Frontend Development
3. Backend API Development
4. Database Design
5. Authentication & Security
6. Reporting System
7. Testing
8. Deployment
9. Training
10. Maintenance
