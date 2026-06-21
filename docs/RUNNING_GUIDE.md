# DevLens Lite – Complete Running Guide

> Understand any GitHub repository in minutes with AI-powered analysis.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Docker – Recommended)](#quick-start-docker)
3. [Local Development Setup](#local-development-setup)
4. [Environment Variables](#environment-variables)
5. [Creating an Admin Account](#creating-an-admin-account)
6. [Folder Structure](#folder-structure)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool       | Version  | Purpose                   |
|------------|----------|---------------------------|
| Node.js    | ≥ 18     | Backend + frontend tooling |
| npm        | ≥ 9      | Package management         |
| MongoDB    | ≥ 6      | Database (or use Docker)   |
| Git        | any      | Cloning repositories       |
| Docker     | ≥ 24     | Optional – easiest setup   |
| Docker Compose | ≥ 2  | Optional – orchestration   |

---

## Quick Start (Docker)

This is the **recommended** way to run DevLens Lite. Everything spins up with one command.

### Step 1 – Clone and configure

```bash
git clone https://github.com/your-username/devlens-lite.git
cd devlens-lite

# Copy env file
cp .env.example .env
```

### Step 2 – Edit `.env`

Open `.env` and set at minimum:

```env
JWT_SECRET=your_random_64_char_secret_here
JWT_REFRESH_SECRET=another_random_64_char_secret_here
GEMINI_API_KEY=your_google_gemini_api_key        # Optional – AI chat works without it
```

Generate secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 3 – Build and start

```bash
docker compose up --build
```

That's it. Services start in order: MongoDB → Backend → Frontend.

### Step 4 – Access the app

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:4000        |
| API health | http://localhost:4000/api/health |

### Step 5 – Create admin user (first run only)

```bash
docker compose exec backend node /app/../scripts/seed-admin.js
```

Default credentials:
- **Email:** `admin@devlens.io`
- **Password:** `Admin123!`

> ⚠️ Change these immediately after first login.

---

## Local Development Setup

Run backend and frontend separately for hot-reload.

### Step 1 – Install dependencies

```bash
# From project root
cd backend  && npm install
cd ../frontend && npm install
```

Or use the automated setup script:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Step 2 – Start MongoDB

**Option A – Docker (easiest):**
```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```

**Option B – Local install:**
```bash
mongod --dbpath /usr/local/var/mongodb
```

### Step 3 – Start backend

```bash
cd backend
cp ../.env .env        # or edit backend/.env directly
npm run dev
```

Backend starts at **http://localhost:4000**

### Step 4 – Start frontend

```bash
cd frontend
npm run dev
```

Frontend starts at **http://localhost:3000**

### Step 5 – Seed admin (optional)

```bash
node scripts/seed-admin.js
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
NODE_ENV=development
PORT=4000

# MongoDB
MONGO_URI=mongodb://localhost:27017/devlens

# JWT Access Token (short-lived)
JWT_SECRET=your_64_char_random_hex
JWT_EXPIRES_IN=15m

# JWT Refresh Token (long-lived)
JWT_REFRESH_SECRET=your_other_64_char_random_hex
JWT_REFRESH_EXPIRES_IN=7d

# Google Gemini AI (https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=AIza...

# Repository clone directory
CLONE_DIR=/tmp/repos

# CORS – your frontend URL
FRONTEND_URL=http://localhost:3000

# Email (optional – uses Ethereal fake SMTP in dev if empty)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@devlens.io
```

### Frontend (`frontend/.env` or Vite env)

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

---

## Creating an Admin Account

```bash
# Option 1 – seed script
node scripts/seed-admin.js

# Option 2 – manually promote an existing user via MongoDB
mongosh devlens --eval 'db.users.updateOne({email:"you@example.com"},{$set:{role:"admin"}})'

# Option 3 – set env vars before running seed
ADMIN_EMAIL=me@example.com ADMIN_PASSWORD=SecurePass123 node scripts/seed-admin.js
```

---

## Folder Structure

```
devlens-lite/
├── .env.example              # Root env template
├── .github/
│   └── workflows/ci.yml      # GitHub Actions CI
├── docker-compose.yml        # Docker orchestration
├── docker/
│   └── nginx.conf            # Reverse proxy config
├── scripts/
│   ├── setup.sh              # One-command local setup
│   └── seed-admin.js         # Create first admin user
├── docs/
│   ├── RUNNING_GUIDE.md      # ← You are here
│   └── API_DOCUMENTATION.md  # Full REST API reference
│
├── backend/
│   ├── Dockerfile
│   ├── nodemon.json
│   ├── package.json
│   └── src/
│       ├── server.js          # Entry point
│       ├── app.js             # Express factory
│       ├── config/
│       │   └── database.js
│       ├── middleware/
│       │   ├── authenticate.js
│       │   ├── errorHandler.js
│       │   ├── rateLimiter.js
│       │   └── validate.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Repository.js
│       │   ├── Analysis.js
│       │   ├── ChatSession.js
│       │   └── Report.js
│       ├── modules/
│       │   ├── auth/           (routes · controller · service)
│       │   ├── repositories/   (routes · controller · service)
│       │   ├── analysis/       (routes · controller · service)
│       │   ├── chat/           (routes · controller · service)
│       │   ├── reports/        (routes · controller · service)
│       │   └── admin/          (routes · controller)
│       ├── analyzers/
│       │   ├── tech.detector.js
│       │   ├── structure.analyzer.js
│       │   ├── dependency.analyzer.js
│       │   ├── security.analyzer.js
│       │   ├── deadcode.analyzer.js
│       │   └── metrics.analyzer.js
│       ├── shared/
│       │   ├── AppError.js
│       │   └── response.js
│       └── utils/
│           └── email.js
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/              (client · auth · repos · analysis · chat · reports · admin)
        ├── components/
        │   ├── charts/       (LanguageChart · MetricsRadar · ActivityChart)
        │   ├── features/     (FileTree · ImportRepoModal · RepoStatusBadge)
        │   ├── layout/       (AppShell · Sidebar · Topbar · AuthLayout · Guards)
        │   └── ui/           (Button · Card · Modal · Skeleton · Spinner · etc.)
        ├── hooks/            (useAuth · useRepositories · useAnalysis · useChat · useReports)
        ├── pages/
        │   ├── auth/         (Login · Register · ForgotPassword · ResetPassword)
        │   ├── dashboard/    (Dashboard)
        │   ├── repository/   (List · Detail)
        │   ├── analysis/     (Analysis · DependencyGraph · Security · DeadCode)
        │   ├── chat/         (Chat)
        │   ├── reports/      (Reports)
        │   ├── settings/     (Settings · Profile)
        │   └── admin/        (Dashboard · Users · Repos)
        ├── store/            (authStore · themeStore)
        └── utils/            (cn · format)
```

---

## Troubleshooting

### MongoDB connection refused
```bash
# Check if Mongo is running
mongosh --eval "db.adminCommand('ping')"
# Start it
docker run -d -p 27017:27017 mongo:7
```

### Backend crash on startup
```bash
# Check Node version
node -v  # must be >= 18
# Check .env exists
ls backend/.env
# View logs
cd backend && npm run dev
```

### Frontend blank page
```bash
# Make sure VITE_API_BASE_URL is correct
echo $VITE_API_BASE_URL
# Rebuild
cd frontend && npm run build
```

### Git clone fails during analysis
```bash
# Ensure git is installed
git --version
# Ensure /tmp/repos is writable
mkdir -p /tmp/repos && chmod 777 /tmp/repos
```

### AI chat returns fallback responses
- Add `GEMINI_API_KEY` to your `.env`
- Get a free key at: https://aistudio.google.com/app/apikey
- The app works fully without it – AI responses are replaced by rule-based answers

### Port already in use
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```
