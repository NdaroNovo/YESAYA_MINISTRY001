# MWONGOZO WA KUHOST YESAYA_MINISTRY NA KUIFUNGUA KWA SIMU

## Lengo

Baada ya kumalisha mfumo, unataka:
1. **Backend** iwe live kwenye internet (test server).
2. **Mobile App** iweze kuunganishwa na backend hiyo.
3. **Watu waweze kuifungua kwa simu** (Android).

## Mahali pa Kuhost (Tumia Render — Bila Malipo)

Tutaumia **Render** kwa sababu:
- Inatoa **Web Service** bila malipo.
- Inatoa **PostgreSQL Database** bila malipo.
- Inaunga mkono Django.
- Ina **health check** tayari (`/api/health/`).

---

## HATUA 1: Jiandae (Muhimu Kabla ya Deploy)

### 1.1 Weka code kwenye GitHub au GitLab

Ikiwa bado hujaweka, fungua terminal:

```bash
cd "c:\xampp\htdocs\YESAYA MINISTRY"
git init
git add .
git commit -m "Initial commit"
```

Kisha weka kwenye GitHub:

```bash
git remote add origin https://github.com/username/yesaya-ministry.git
git branch -M main
git push -u origin main
```

Badala ya `username`, weka jina lako la GitHub.

### 1.2 Hakikisha files zifuatazo zipo

- `backend/render.yaml` — inaelezea Render setup.
- `backend/build.sh` — inafanya migrate, collectstatic, seed.
- `backend/requirements.txt` — ina dependencies zote za Python.

---

## HATUA 2: Sajili Akaunti ya Render

1. Fungua: https://render.com
2. Bonyeza **Sign Up** (unaweza kutumia GitHub account).
3. Thibitisha email.
4. Ingia kwenye Dashboard.

---

## HATUA 3: Deploy Backend kwa Render

### 3.1 Deploy kwa kutumia Blueprint (Rahisi zaidi)

1. Katika Render Dashboard, bonyeza **Blueprints**.
2. Bonyeza **New Blueprint Instance**.
3. Chagua repository yako `yesaya-ministry`.
4. Render itauliza jina la service. Weka jina kama `yesaya-ministry-api`.
5. Bonyeza **Apply**.
6. Render itasoma `backend/render.yaml` na kuanzisha:
   - Web Service ya Django
   - PostgreSQL database
7. Subiri hadi deploy iwe **Live** (inaweza chukua dakika 5-10).

### 3.1b Deploy kwa kutumia Web Service (Manual)

Ikiwa Blueprint haifanyi kazi:

1. Dashboard → **New** → **Web Service**.
2. Chagua repository yako.
3. Weka:
   - **Name:** `yesaya-ministry-api`
   - **Runtime:** Python 3
   - **Build Command:** `./backend/build.sh` au `cd backend && ./build.sh`
   - **Start Command:** `cd backend && gunicorn backend.wsgi:application`
4. Ongeza environment variables:
   - `DATABASE_URL` → (utaweka baada ya hatua 3.2)
   - `SECRET_KEY` → (tengeneza string ndefu, mfano: `django-insecure-12345...`)
   - `DEBUG=False`
   - `ALLOWED_HOSTS=yesaya-ministry-api.onrender.com,*`
   - `CORS_ALLOW_ALL_ORIGINS=True`
5. Bonyeza **Create Web Service**.

### 3.2 Unda PostgreSQL Database

1. Dashboard → **New** → **PostgreSQL**.
2. Weka:
   - **Name:** `yesaya-ministry-db`
   - **Database:** `yesaya_ministry`
   - **User:** `yesaya_ministry`
3. Bonyeza **Create Database**.
4. Baada ya database kuwa ready, bonyeza **Copy** kwa **Internal Database URL**.
5. Enda kwenye Web Service → **Environment** → **Add Environment Variable**:
   - Key: `DATABASE_URL`
   - Value: URL uliyokopoa
6. Bonyeza **Save Changes**.

### 3.3 Anzisha upya Web Service

Baada ya kuweka `DATABASE_URL`, bonyeza **Manual Deploy** → **Deploy latest commit**. Hii itafanya:
- Install Python packages
- Run migrations
- Seed default offering types
- Start Django server

### 3.4 Hakikisha Backend Inafanya Kazi

Fungua browser:

```
https://yesaya-ministry-api.onrender.com/api/health/
```

Ikiwa unaona:

```json
{"status": "ok", "service": "YESAYA MINISTRY API"}
```

Backend iko live.

---

## HATUA 4: Unda Superuser

Ili uweze kuingia kwenye app, unahitaji user:

1. Render Dashboard → Web Service (`yesaya-ministry-api`) → **Shell**.
2. Andika:

```bash
cd backend
python manage.py createsuperuser
```

3. Jaza:
   - Username: `admin`
   - Email: `admin@yesaya.com`
   - Password: (weka nenosiri kali, rudia)

Sasa unaweza kuingia kwenye app kwa `admin` na nenosiri lako.

---

## HATUA 5: Unganisha Mobile App na Backend

1. Fungua faili:
   ```
   mobile/src/utils/env.ts
   ```

2. Badilisha `API_URL` kuwa URL ya backend yako:

```ts
const API_URL = "https://yesaya-ministry-api.onrender.com/api";
```

3. Save file.

---

## HATUA 6: Fungua App Kwenye Simu

Kuna njia mbili:

### Njia A: Kwa kutumia Expo Go (Rahisi, bila kujenga APK)

1. Sakinisha **Expo Go** kutoka Play Store kwenye simu yako.
2. Kwenye kompyuta, fungua terminal:

```bash
cd "c:\xampp\htdocs\YESAYA MINISTRY\mobile"
npm install --legacy-peer-deps
npx expo start
```

3. Scanner QR code itaonekana.
4. Fungua **Expo Go** kwenye simu, skeni QR code.
5. App itaanza kufunguka kwenye simu.

**Gharama:** Bure. **Lazima:** Simu na kompyuta kuwa kwenye same Wi-Fi.

### Njia B: Kujenga APK (Kushare na watu wengi)

1. Sakinisha EAS CLI:

```bash
npm install -g eas-cli
```

2. Login kwenye EAS:

```bash
eas login
```

3. Hakiiki `mobile/eas.json` ipo (imeandikwa tayari).

4. Anzisha build:

```bash
cd "c:\xampp\htdocs\YESAYA MINISTRY\mobile"
eas build -p android --profile preview
```

5. Subiri (inaweza chukua dakika 10-20).
6. EAS itakupa link ya kupakua APK.
7. Pakua APK ukiweke kwenye simu, kisha install.

---

## HATUA 7: Test kwa Simu

1. Fungua app.
2. Utaona skrini ya login na ikoni `MY`.
3. Weka username `admin` na password uliyounda.
4. App itapakua dashboard, makanisa, ripoti, n.k.

---

## Changamoto Zinazoweza Kutokea

### 1. "CORS error" kwenye app

**Sababu:** Backend hairuhusu app kufikia.  
**Suluhisho:** Hakikisha `CORS_ALLOW_ALL_ORIGINS=True` imewekwa kwenye Render env vars.

### 2. "Cannot connect to server"

**Sababu:** Backend haijawahi deploy vizuri.  
**Suluhisho:** Angalia Render logs, hakikisha `DATABASE_URL` imewekwa, halafu deploy tena.

### 3. App inafungua lakini login haifanyi kazi

**Sababu:** Hakuna superuser.  
**Suluhisho:** Run `python manage.py createsuperuser` katika Render shell.

### 4. Build ya APK inashindwa

**Sababu:** Assets hazipo au EAS haijaweka.  
**Suluhisho:** Hakikisha una `icon.png` na `splash.png` katika `mobile/assets/`. Pia hakikisha `eas login` imefanyika.

---

## Mfano wa URL Baada ya Host

| Sehemu | URL ya mfano |
|--------|--------------|
| Backend API | `https://yesaya-ministry-api.onrender.com/api/` |
| Health Check | `https://yesaya-ministry-api.onrender.com/api/health/` |
| Admin Panel | `https://yesaya-ministry-api.onrender.com/admin/` |
| Mobile App | `YESAYA_MINISTRY` (apk au Expo Go) |

---

## Muhtasari wa Hatua

1. Weka code kwenye GitHub.
2. Sajili Render.
3. Deploy backend kwa Blueprint au Web Service.
4. Unda PostgreSQL database na uunganishe.
5. Unda superuser.
6. Weka `API_URL` ndani ya `mobile/src/utils/env.ts`.
7. Run `npx expo start` au `eas build -p android --profile preview`.
8. Fungua app kwa simu.
