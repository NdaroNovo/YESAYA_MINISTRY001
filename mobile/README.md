# YESAYA_MINISTRY — Android App

App ya Android kwa ajili ya mfumo wa usimamizi wa Jimbo, Mitaa na Makanisa.

**Jina la Application:** `YESAYA_MINISTRY`  
**Icone ya App:** `MY` (herufi mbili zimebebana kwenye mduara wa dhahabu)

## Lugha na Framework

| Sehemu | Lugha | Framework / Zana |
|--------|-------|------------------|
| Mobile App | **TypeScript** | **React Native + Expo** |
| Navigation | TypeScript | **React Navigation** (Bottom Tabs + Native Stack) |
| State Management | TypeScript | **Zustand** + AsyncStorage |
| HTTP Client | TypeScript | **Axios** |
| Secure Storage | TypeScript | **Expo Secure Store** |
| Location | TypeScript | **Expo Location** |
| Backend API | Python | **Django + Django REST Framework** |
| Database | SQL | **PostgreSQL** (production) / SQLite (development) |
| Authentication | JSON | **JWT (SimpleJWT)** |

## Rangi zilizotumika (chache na zenye kupendeza)

- **Navy:** `#0F172A` — vichwa, vifungo, navigation
- **Gold:** `#D4AF37` — accents, icons, active tabs
- **White:** `#FFFFFF` — cards, maandishi mweusi juu
- **Light Gray:** `#F8FAFC` — background
- **Text Gray:** `#6B7280` — maandishi ya pili
- **Success:** `#10B981` — ujumbe mzuri
- **Error:** `#EF4444` — makosa

## Authentication Flow (Mfuatano wa Kuingia)

1. **Mfumoni:** Mtumiaji anafungua app `YESAYA_MINISTRY` anakiona skrini ya login na ikoni `MY`.
2. **Kuingiza taarifa:** Anaweka **jina la mtumiaji** na **nenosiri**.
3. **Location capture:** App inaomba ruhusa ya location (hiari). Kama imekubali, anwani ya GPS inachukuliwa.
4. **Tuma kwenye API:** App inatuma `POST /api/auth/login/` kwa backend.
5. **Backend inathibitisha:** Django inakagua username/password, kisha inarudisha **JWT access token**, **refresh token**, na **taarifa za user** (role, jina, mtaa/kanisa aliyopewa).
6. **Hifadhi token:** Access token inahifadhiwa kwa usalama katika `Expo Secure Store`.
7. **State update:** Zustand inasasisha hali ya authentication, na app inaelekea kwenye **Main Tabs** (Dashboard, Churches, Records, Reports, Profile).
8. **Auto-login:** Kila app inapofunguliwa tena, token inakaguliwa kwa `GET /api/users/me/` kuhakikisha bado ni sahihi.

## Flow ya Kazi kwa Kila Kipengele

### 1. Dashboard
- **Flow:** Fungua app → Login → Dashboard
- **Inachofanya:** Inaonyesha muhtasari wa idadi ya mitaa, makanisa, wanachama, waliobatizwa, waliokombolewa, na jumla ya matoleo.
- **API:** `GET /api/dashboard-stats/`

### 2. Makanisa (Churches)
- **Flow:** Dashboard → Bottom Tab "Makanisa"
- **Inachofanya:**
  - Kuonyesha orodha ya makanisa yote
  - Ongeza kanisa jipya (jina, mchungaji, simu, anuani, wanachama, mtaa)
  - Hariri kanisa
  - Futa kanisa
- **API:** `GET /api/churches/`, `POST /api/churches/`, `PATCH /api/churches/{id}/`, `DELETE /api/churches/{id}/`

### 3. Taarifa (Records — Uinjilisti & Matoleo)
- **Flow:** Dashboard → Bottom Tab "Taarifa"
- **Inachofanya:**
  - Badilisha kati ya **Uinjilisti** na **Matoleo** kwa tab
  - Ongeza taarifa za uinjilisti (mwezi, mwaka, waliobatizwa, waliokombolewa, waliotembelewa, waliosaidika)
  - Ongeza matoleo (aina, kiasi, mwezi, mwaka)
  - Location inahifadhiwa pamoja na kila record
- **API:**
  - Uinjilisti: `GET /api/evangelism/`, `POST /api/evangelism/`
  - Matoleo: `GET /api/offerings/`, `POST /api/offerings/`
  - Aina za matoleo: `GET /api/offering-types/`

### 4. Ripoti (Reports)
- **Flow:** Dashboard → Bottom Tab "Ripoti"
- **Inachofanya:** Inaonyesha taarifa zote za mfumo kwa mtindo wa ripoti muhtasari.
- **API:** `GET /api/dashboard-stats/`

### 5. Wasifu (Profile)
- **Flow:** Dashboard → Bottom Tab "Wasifu"
- **Inachofanya:**
  - Kuonyesha taarifa za mtumiaji (jina, role, email, simu)
  - Kubadilisha nenosiri
  - Kutoka (logout)
- **API:** `GET /api/users/me/`, `POST /api/change-password/`

## Setup (Local Development)

```bash
cd mobile
npm install
npx expo start
```

Bonyeza `a` kuanzisha Android emulator.

## Build APK (kwa ajili ya testing)

```bash
npm install -g eas-cli
eas build -p android --profile preview
```

## Kuunganisha na Backend

Badilisha `API_URL` ndani ya `src/utils/env.ts` kuwa anwani ya backend yako:

```ts
const API_URL = "https://yesaya-ministry-api.onrender.com/api";
```

## Kuhifadhi Backend kwenye Server za Test

Tumia **Render** (bila malipo) kwa ajili ya backend:

1. Sajili akaunti kwenye [render.com](https://render.com)
2. Ingia kwenye **Blueprints** → **New Blueprint Instance**
3. Chagua repo hii kwenye GitHub/GitLab
4. Render itasoma `backend/render.yaml` na kuanzisha:
   - Web service ya Django (`yesaya-ministry-api`)
   - PostgreSQL database (`yesaya-ministry-db`)
5. Env vars zitaanzishwa kiotomatiki:
   - `DATABASE_URL` (kutoka database)
   - `SECRET_KEY` (kutokana na Render)
   - `DEBUG=False`
   - `ALLOWED_HOSTS=yesaya-ministry-api.onrender.com,*`
   - `CORS_ALLOW_ALL_ORIGINS=True`
6. Baada ya deploy, API itapatikana:
   - `https://yesaya-ministry-api.onrender.com/api/`
   - Health check: `https://yesaya-ministry-api.onrender.com/api/health/`
7. Ingia kwenye admin uunde superuser:
   - `python manage.py createsuperuser` (kupitia Render shell)

## Mfumo wa Roles

- **Super Admin:** Msimamizi mkuu wa mfumo
- **Jimbo Admin:** Msimamizi wa Jimbo nzima
- **Mtaa Leader:** Kiongozi wa Mtaa fulani
- **Church Leader:** Kiongozi wa Kanisa fulani
- **Viewer:** Mtu anayeweza tu kuangalia taarifa

## Maandishi (Typography)

- **Font size:** 12px (xs), 14px (sm), 16px (base), 18px (md), 20px (lg), 24px (xl), 30px (2xl), 36px (3xl)
- **Font weight:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Line height:** 20 (tight), 24 (normal), 28 (relaxed)
- Maandishi yote yanatumia rangi kali ili kusomeka vizuri (text `#1F2937`, text muted `#6B7280`).
