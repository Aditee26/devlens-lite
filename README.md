<div align="center">

# 🔍 DevLens Lite

**Understand any GitHub repository in minutes — AI-powered repository intelligence platform.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-devlens--lite.netlify.app-6d4cf5?style=for-the-badge&logo=netlify&logoColor=white)](https://devlens-lite.netlify.app/)

![Stack](https://img.shields.io/badge/Stack-MERN-00d084?style=flat-square)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-8E75B2?style=flat-square&logo=google&logoColor=white)

</div>

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Auth** | Register, Login, JWT + Refresh Tokens, Forgot/Reset Password |
| 📦 **Repo Import** | Paste any public GitHub URL — DevLens clones and analyzes automatically |
| 🧠 **Tech Detection** | Detects 40+ frameworks, languages, and tools |
| 📊 **Metrics Dashboard** | LOC, complexity score, largest files, language breakdown |
| 🕸️ **Dependency Graph** | Interactive import graph with React Flow |
| 🛡️ **Security Scanner** | Hardcoded secrets, unsafe patterns, API key detection |
| 💀 **Dead Code** | Unused imports, unexported functions |
| 🤖 **AI Chat** | Ask anything about the repo — powered by Google Gemini |
| 📄 **Reports** | Export PDF or JSON reports |
| 👑 **Admin Panel** | User management, system metrics, repo monitoring |
| 🌙 **Dark / Light Mode** | Full theme support |

---

## 🚀 Quick Start (Docker — recommended)

```bash
# 1. Clone
git clone https://github.com/your-username/devlens-lite.git
cd devlens-lite

# 2. Configure
cp .env.example .env
# Edit .env → set JWT_SECRET, JWT_REFRESH_SECRET, GEMINI_API_KEY

# 3. Run
docker compose up --build

# 4. Open
open http://localhost:3000
```

---

## 💻 Local Development

```bash
# Install all deps
cd backend  && npm install && cd ..
cd frontend && npm install && cd ..

# Start MongoDB (Docker)
docker run -d -p 27017:27017 mongo:7

# Terminal 1 – Backend
cd backend && npm run dev

# Terminal 2 – Frontend
cd frontend && npm run dev
```

---

## 🔑 Environment Variables

Copy `.env.example` → `.env` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ | 64-char random secret |
| `JWT_REFRESH_SECRET` | ✅ | Different 64-char secret |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `GEMINI_API_KEY` | ⚡ Optional | Google Gemini API key for AI chat |
| `CLONE_DIR` | ✅ | Directory for git clones (`/tmp/repos`) |

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 👤 First Admin User

```bash
node scripts/seed-admin.js
# Email: admin@devlens.io  |  Password: Admin123!
```

---

## 📁 Project Structure

```
devlens-lite/
├── backend/          Node.js + Express API
├── frontend/         React 19 + Vite SPA
├── docker/           Nginx reverse proxy config
├── scripts/          Setup & seed scripts
├── docs/             Running guide & API docs
└── docker-compose.yml
```

---

## 🛠️ Tech Stack

**Frontend:** React 19, Vite, TailwindCSS, React Query, React Flow, Recharts, Framer Motion, Zustand

**Backend:** Node.js, Express.js, Mongoose, JWT, bcryptjs, simple-git, PDFKit

**Database:** MongoDB

**AI:** Google Gemini 1.5 Flash

**DevOps:** Docker, Docker Compose, Nginx, GitHub Actions

---

## 📖 Documentation

- [Running Guide](docs/RUNNING_GUIDE.md) — Full setup and troubleshooting
- API health: `http://localhost:4000/api/health`

---

## 📜 License

MIT © DevLens Lite
