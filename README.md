# Telecom Test Platform v2

Cloud-native SaaS MVP for telecom test management and remote Android Agent control.

## What is included

- Backend: Node.js, Express, PostgreSQL, JWT, WebSocket
- Frontend: React, Vite, Material UI
- Database: PostgreSQL schema and seed admin user
- Android Agent skeleton: Kotlin files for registration, heartbeat, WebSocket command handling
- Render deployment blueprint
- Docker Compose for local PostgreSQL + Backend + Frontend

## MVP features

- Login
- Customer/user model
- Device management
- Test case creation
- Run test cases
- Execution dashboard
- Results page
- Reports page
- WebSocket endpoint for Android Agent/device connection

## Default local login

After database migration/seed:

```text
Email: admin@example.com
Password: Admin123!
```

## Local quick start

### 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Backend health check:

```text
http://localhost:4000/health
```

### 3. Frontend

Open another terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial telecom test platform MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/telecom-test-platform-v2.git
git push -u origin main
```

## Render deployment overview

1. Push this repo to GitHub.
2. In Render, create a PostgreSQL database.
3. Create backend Web Service:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run db:migrate && npm run db:seed`
   - Start Command: `npm start`
   - Environment variables:
     - `DATABASE_URL` = Render PostgreSQL internal connection string
     - `JWT_SECRET` = long random secret
     - `CORS_ORIGIN` = your frontend Render URL
4. Create frontend Static Site:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment variable:
     - `VITE_API_URL` = your backend Render URL

## Important Android note

MO call, SMS send, URL browsing, heartbeat and result upload are practical MVP features. Full MT auto-answer and advanced call control typically require the Android Agent to be default dialler / enterprise-managed device permissions.
