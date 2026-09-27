# YESAYA_MINISTRY — Documentation

## 1. Jina la Application na Icone

- **Jina la Application:** `YESAYA_MINISTRY`
- **Icone ya App:** `YM` (herufi mbili zimebebana kwenye mduara wa dhahabu)
- **Package Name:** `org.yesayaministry.app`

## 2. Lugha na Framework zilizotumika

| Sehemu | Lugha | Framework / Zana | Kazi yake |
|--------|-------|------------------|-----------|
| Mobile App | **TypeScript** | **React Native + Expo** | Kuunda app ya Android yenye UI ya kisasa |
| Navigation | TypeScript | **React Navigation** | Kusogea kati ya skrini (Stack + Bottom Tabs) |
| State Management | TypeScript | **Zustand** + AsyncStorage | Kuhifadhi hali ya user na authentication |
| HTTP Client | TypeScript | **Axios** | Kuwasiliana na backend API |
| Secure Storage | TypeScript | **Expo Secure Store** | Kuhifadhi JWT token kwa usalama |
| Location | TypeScript | **Expo Location** | Kukusanya GPS location kwa login na records |
| Backend API | **Python** | **Django + Django REST Framework** | Kutoa API endpoints na kudhibiti data |
| Database | **SQL** | **PostgreSQL** (production) / SQLite (dev) | Kuhifadhi data zote za mfumo |
| Authentication | **JSON / JWT** | **djangorestframework-simplejwt** | Kuhakikisha mtumiaji ni sahihi |

## 3. Authentication Flow (Mfuatano wa Kuingia)

```
[Fungua App] → [Skrini ya Login (MY icon)] → [Jaza username + password]
    ↓
[Omba ruhusa ya Location (hiari)] → [Chukua GPS]
    ↓
[POST /api/auth/login/] → [Backend inakagua username/password]
    ↓
[Backend inarudisha access token + refresh token + user data]
    ↓
[Hifadhi access token + refresh token kwa Expo Secure Store]
    ↓
[Zustand inasasisha auth state] → [Elekea Main Tabs]
    ↓
[Kila baadae: GET /api/users/me/ kuhakikisha token bado sahihi]
    ↓
[Access token ikiisha (401) → app inaomba mpya kwa POST /api/auth/refresh/ kiotomatiki;
 refresh token nayo ikiisha → mtumiaji anarudishwa Login]
```

- Location ya login (kama imeruhusiwa) inatumwa kwa headers `X-Location-Lat` / `X-Location-Lng`.
- Bila intaneti app haimtoi mtumiaji; inamtoa tu kama server imekataa token.
- Kwenye skrini ya Login, kitufe cha **Server** kinaruhusu kubadilisha anwani ya server
  (mf. server ya demo `192.168.1.10:8010`) na kuijaribu kabla ya kuingia.

### Endpoints za Authentication

| Method | Endpoint | Kazi |
|--------|----------|------|
| POST | `/api/auth/login/` | Kuingia na kupata JWT token |
| POST | `/api/auth/refresh/` | Kubadilisha refresh token kuwa access token mpya |
| GET | `/api/users/me/` | Kupata taarifa za user aliyeingia |
| POST | `/api/change-password/` | Kubadilisha nenosiri |

## 4. Flow ya Kazi kwa Kila Kipengele

### 4.1 Dashboard

**Flow:**
```
Login → Main Tabs → Dashboard
```

**Inachofanya:**
- Inaonyesha muhtasari wa mfumo.
- Inapakia data kutoka `GET /api/dashboard-stats/`.
- Inaonyesha:
  - Jumla ya Mitaa
  - Jumla ya Makanisa
  - Jumla ya Wanachama
  - Waliobatizwa
  - Waliokombolewa
  - Jumla ya Matoleo

### 4.2 Makanisa (Churches)

**Flow:**
```
Dashboard → Tab "Mitaa" → Chagua Mtaa → Orodha ya makanisa ya mtaa huo
    ↓
[Bonyeza "Ongeza Kanisa"] → [Jaza fomu] → [Hifadhi]
    ↓
[Backend inahifadhi katika PostgreSQL] → [Orodha inasasishwa]
```

**Inachofanya:**
- Kuonyesha makanisa yote.
- Kuongeza kanisa jipya.
- Kuhariri kanisa lililopo.
- Kufuta kanisa.

**API Endpoints:**
| Method | Endpoint | Kazi |
|--------|----------|------|
| GET | `/api/churches/` | Orodha ya makanisa |
| POST | `/api/churches/` | Ongeza kanisa |
| PATCH | `/api/churches/{id}/` | Hariri kanisa |
| DELETE | `/api/churches/{id}/` | Futa kanisa |

### 4.3 Taarifa (Records — Uinjilisti & Matoleo)

**Flow:**
```
Dashboard → Tab "Taarifa" → Chagua Tab (Uinjilisti / Matoleo)
    ↓
[Bonyeza "Ongeza Taarifa"] → [Jaza fomu] → [Chukua Location] → [Hifadhi]
    ↓
[Backend inahesabu mgawanyo wa kanisa/jimbo kwa matoleo] → [Orodha inasasishwa]
```

Taarifa zinaweza pia kuingizwa ndani ya kanisa husika: Mitaa → Mtaa → Kanisa → Uinjilisti / Matoleo
(hapo unaweza kuhariri na kufuta pia).

**Inachofanya:**
- **Uinjilisti:** Kuhifadhi kila mwezi idadi ya waliobatizwa, waliokombolewa, waliotembelewa, waliosaidika.
- **Matoleo:** Kuhifadhi kiasi cha matoleo, aina, mwezi, mwaka. Mfumo unahesabu kiotomatiki mchango wa Kanisa na Jimbo kulingana na aina ya toleo.

**API Endpoints:**
| Method | Endpoint | Kazi |
|--------|----------|------|
| GET | `/api/evangelism/` | Orodha ya uinjilisti |
| POST | `/api/evangelism/` | Ongeza taarifa ya uinjilisti |
| GET | `/api/offerings/` | Orodha ya matoleo |
| POST | `/api/offerings/` | Ongeza toleo |
| GET | `/api/offering-types/` | Aina za matoleo na mgawanyo wao |

### 4.4 Ripoti (Reports)

**Flow:**
```
Dashboard → Tab "Ripoti" → Muhtasari wa taarifa zote
```

**Inachofanya:**
- Inaonyesha taarifa zote za mfumo kwa mtindo wa ripoti.
- Inatumia data kutoka `GET /api/dashboard-stats/`.

### 4.5 Wasifu (Profile)

**Flow:**
```
Dashboard → Tab "Wasifu" → Angalia taarifa zako
    ↓
[Bonyeza "Badilisha Nenosiri"] → [Jaza nenosiri la sasa na jipya] → [Hifadhi]
    ↓
[POST /api/change-password/]
```

**Inachofanya:**
- Kuonyesha jina, role, email, na simu.
- Kubadilisha nenosiri.
- Kutoka (logout) na kufuta token.

## 5. Rangi zilizotumika (chache na zenye kupendeza)

| Rangi | Code | Matumizi |
|-------|------|----------|
| Navy | `#0F172A` | Vichwa, vifungo vikuu, navigation bar |
| Gold | `#D4AF37` | Accents, active tabs, icons, logo background |
| White | `#FFFFFF` | Cards, maandishi juu ya rangi za kijivu |
| Light Gray | `#F8FAFC` | Background ya skrini |
| Text Gray | `#6B7280` | Maandishi ya pili, subtitles |
| Success | `#10B981` | Ujumbe mzuri, ongezeko |
| Error | `#EF4444` | Makosa, futa |
| Warning | `#F59E0B` | Onyo |
| Info | `#3B82F6` | Taarifa za ziada |

## 6. Maandishi (Typography)

- **Font sizes:** 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px
- **Font weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Line heights:** 20 (tight), 24 (normal), 28 (relaxed)
- Maandishi yote yanatumia rangi kali ya `#1F2937` na maandishi ya pili `#6B7280` ili kusomeka vizuri.

## 7. Mfumo wa Roles (User Roles)

| Role | Mamlaka |
|------|---------|
| **Super Admin** | Msimamizi mkuu — anaweza kufanya kila kitu |
| **Jimbo Admin** | Msimamizi wa Jimbo — anaweza kuona/kudhibiti Jimbo nzima |
| **Mtaa Leader** | Kiongozi wa Mtaa — anaweza kuona/kudhibiti mtaa wake tu |
| **Church Leader** | Kiongozi wa Kanisa — anaweza kuona/kudhibiti kanisa lake tu |
| **Viewer** | Mwangaliazi — anaweza tu kuangalia taarifa |

App inaficha vitufe vya kuongeza/kuhariri/kufuta kwa mtumiaji asiye na ruhusa:

| Kitendo | Role ya chini inayohitajika |
|---------|------------------------------|
| Jimbo / Mitaa | Jimbo Admin |
| Makanisa (na idadi ya wanachama) | Mtaa Leader (mtaa wake tu) |
| Uinjilisti / Matoleo | Church Leader (kanisa lake tu) |

## 8. Database (PostgreSQL)

Tabo muhimu:

| Table | Kuhifadhi |
|-------|-----------|
| `ym_user` | Watumiaji na roles zao |
| `ym_jimbo` | Taarifa za Jimbo |
| `ym_mtaa` | Mitaa iliyo chini ya Jimbo |
| `ym_church` | Makanisa iliyo chini ya Mtaa |
| `ym_evangelism_record` | Taarifa za uinjilisti kila mwezi |
| `ym_offering` | Matoleo na mgawanyo wao |
| `ym_offering_type` | Aina za matoleo na asilimia za mgawanyo |
| `ym_audit_log` | Historia ya vitendo vya watumiaji |

## 9. Maelekezo ya Kuhifadhi kwenye Server za Test (Render)

> **Mwongozo wa hatua kwa hatua wa hosting na kufungua app kwenye simu** upo katika faili `docs/HOSTING.md`. Ukurasa huu una muhtasari.

### Hatua 1: Jiandae

1. Sajili akaunti kwenye [render.com](https://render.com).
2. Weka code yako kwenye GitHub au GitLab.

### Hatua 2: Deploy Backend kwa Render

1. Ingia kwenye Render Dashboard → **Blueprints** → **New Blueprint Instance**.
2. Chagua repo yenye `YESAYA MINISTRY`.
3. Render itasoma `backend/render.yaml` na kuanzisha:
   - **Web Service:** `yesaya-ministry-api`
   - **Database:** `yesaya-ministry-db` (PostgreSQL)
4. Env vars zitaanzishwa kiotomatiki:
   - `DATABASE_URL` (kutoka PostgreSQL)
   - `SECRET_KEY` (kutokana na Render)
   - `DEBUG=False`
   - `ALLOWED_HOSTS=yesaya-ministry-api.onrender.com,*`
   - `CORS_ALLOW_ALL_ORIGINS=True`
5. Build script `backend/build.sh` itafanya:
   - `pip install -r requirements.txt`
   - `python manage.py collectstatic --no-input`
   - `python manage.py migrate`
   - `python manage.py seed_defaults`
6. Baada ya deploy, API itapatikana:
   - `https://yesaya-ministry-api.onrender.com/api/`
   - Health check: `https://yesaya-ministry-api.onrender.com/api/health/`

### Hatua 3: Unda Superuser

1. Kwenda kwenye Render Dashboard → Web Service → Shell.
2. Andika:
   ```bash
   python manage.py createsuperuser
   ```
3. Jaza username, email, na password.

### Hatua 4: Unganisha Mobile App na Backend

1. Fungua `mobile/src/utils/env.ts`.
2. Badilisha `API_URL` kuwa:
   ```ts
   const API_URL = "https://yesaya-ministry-api.onrender.com/api";
   ```
3. Fungua app upya.

> Bila kujenga APK upya, server inaweza pia kubadilishwa ndani ya app: **Login → Server**.

### Hatua 5: Unda APK ya Test

1. Sakinisha EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Ingia kwenye mobile directory:
   ```bash
   cd mobile
   ```
3. Build APK:
   ```bash
   eas build -p android --profile preview
   ```
4. Pakua APK kutoka EAS dashboard ukiweka kwenye simu ya Android.

## 10. Demo (SQLite) na APK ya Kujaribu

Kwa ajili ya demo kuna database tofauti `backend/demo.sqlite3` (haiguswi `db.sqlite3`).
Inajazwa na `python manage.py seed_demo` ikiwa na:

- Jimbo 1 (`Jimbo la Mashariki (Demo)`), Mitaa 3, Makanisa 8
- Taarifa za uinjilisti na matoleo za miezi 12 iliyopita (mgawanyo wa Kanisa/Jimbo unahesabiwa kama kawaida)
- Mtumiaji mmoja kwa kila role, nenosiri `Demo@2026`:

| Username | Role | Anaona |
|----------|------|--------|
| `demo_admin` | Super Admin | Kila kitu |
| `demo_jimbo` | Jimbo Admin | Jimbo zima |
| `demo_mtaa` | Mtaa Leader | Mtaa wa Kinondoni (makanisa 3) |
| `demo_kanisa` | Church Leader | Kanisa la Mwenge tu |
| `demo_viewer` | Viewer | Kila kitu (kusoma tu) |

### Kuwasha server ya demo (Windows)

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File .un_demo.ps1          # -Reset kuanza upya na data safi
```

Script inaonyesha IP ya kompyuta. Kwenye APK: **Login → Server → weka `IP:8010` → Jaribu Muunganiko → Hifadhi**,
kisha gusa akaunti ya demo. Simu na kompyuta ziwe kwenye WiFi moja. Kurudi server rasmi: **Server → Rudi Server Rasmi**.

### Kujenga APK ndani ya kompyuta (bila EAS)

Inahitaji Node 20, JDK 17 na Android SDK (platform 34, build-tools 34, NDK 26.1):

```bash
cd mobile
npx expo prebuild -p android --clean
cd android && ./gradlew assembleRelease
# APK: mobile/android/app/build/outputs/apk/release/app-release.apk
```

## 11. Maelezo ya Ufundi

### Project Structure ya Mobile App

```
mobile/
├── App.tsx                      # Kiingilio cha app
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── src/
│   ├── api/
│   │   ├── client.ts            # Axios setup na interceptors
│   │   └── services.ts          # API calls zote
│   ├── components/
│   │   └── common.tsx           # Reusable UI components (Card, Input, Button, etc.)
│   ├── hooks/
│   │   └── useLocation.ts       # Location capture hook
│   ├── navigation/
│   │   ├── AppNavigator.tsx     # Stack navigator (Login / Main)
│   │   └── MainTabs.tsx         # Bottom tab navigator
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx  # Skrini ya kuingia
│   │   └── main/
│   │       ├── DashboardScreen.tsx
│   │       ├── MitaaScreen.tsx         # Mitaa → MtaaChurchesScreen → ChurchDetailScreen
│   │       ├── RecordsScreen.tsx       # Tab ya Taarifa
│   │       ├── ReportsScreen.tsx
│   │       └── ProfileScreen.tsx
│   ├── store/
│   │   └── authStore.ts         # Zustand auth store
│   ├── theme/
│   │   ├── colors.ts            # Design tokens
│   │   └── typography.ts        # Font sizes / weights
│   ├── types.ts                 # TypeScript interfaces
│   └── utils/
│       ├── env.ts               # Environment variables
│       └── helpers.ts           # Helpers (months, formatMoney, roleLabel)
```

## 12. Endpoints za API kwa Ujumla

| Endpoint | Method | Kazi |
|----------|--------|------|
| `/api/auth/login/` | POST | Login |
| `/api/auth/refresh/` | POST | Refresh token |
| `/api/health/` | GET | Health check |
| `/api/dashboard-stats/` | GET | Dashboard stats |
| `/api/users/` | GET/POST | Watumiaji |
| `/api/users/me/` | GET | User aliyeingia |
| `/api/change-password/` | POST | Badilisha nenosiri |
| `/api/jimbo/` | GET/POST/PATCH/DELETE | Jimbo |
| `/api/mitaa/` | GET/POST/PATCH/DELETE | Mitaa |
| `/api/churches/` | GET/POST/PATCH/DELETE | Makanisa |
| `/api/evangelism/` | GET/POST/PATCH/DELETE | Uinjilisti |
| `/api/offerings/` | GET/POST/PATCH/DELETE | Matoleo |
| `/api/offering-types/` | GET/POST/PATCH/DELETE | Aina za matoleo |
