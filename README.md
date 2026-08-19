# 🔍 DevLens Lite

> **AI Repository Intelligence Platform** — import a public GitHub repository and get
> automatic technology detection, a dependency graph, and an AI assistant you can ask
> questions about the codebase.

![Stack](https://img.shields.io/badge/Stack-MERN-00d084?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
# DevLens Lite

**Understand any public GitHub repository in minutes.**

DevLens Lite is an AI-powered GitHub repository analyzer that helps developers quickly understand unfamiliar codebases. Paste a public GitHub repository URL, and DevLens automatically clones the repository, analyzes its structure, detects technologies and dependencies, calculates code metrics, and provides an AI assistant for asking questions about the codebase.

**Live Demo:** [devlens-lite.netlify.app](https://devlens-lite.netlify.app/)

---

## ✨ Features

### 🔐 Authentication

* User registration and login
* JWT-based authentication
* Profile editing
* Password change

### 📦 Repository Analysis

* Import any public GitHub repository using its URL
* Automatically clone and analyze repositories
* Real-time analysis status and progress

### 🛠️ Technology Detection

Automatically identifies:

* Programming languages
* Frameworks
* Libraries and tools
* Project configuration

### 📊 Code Metrics

Get an overview of:

* Total files and folders
* Lines of code
* Language distribution
* Largest files

### 🔗 Dependency Visualization

* Interactive internal import/dependency graph using React Flow
* External package and dependency list
* Visual representation of project structure

### 🤖 AI Codebase Assistant

Ask questions about the imported repository using Google Gemini.

Examples:

* "What does this project do?"
* "Explain the authentication flow."
* "Where is the database connection handled?"
* "How does the frontend communicate with the backend?"

If a Gemini API key is not configured, DevLens automatically uses a rule-based fallback responder.

### 📄 Reports

Generate and download repository analysis reports in:

* PDF
* JSON

### 🌓 Themes

* Light mode
* Dark mode

---

## 🏗️ Tech Stack

| Category     | Technologies                                                                           |
| ------------ | -------------------------------------------------------------------------------------- |
| **Frontend** | React 19, Vite, Tailwind CSS, React Query, React Router, React Flow, Recharts, Zustand |
| **Backend**  | Node.js, Express.js, Mongoose, JWT, bcryptjs, simple-git, PDFKit                       |
| **Database** | MongoDB                                                                                |
| **AI**       | Google Gemini                                                                          |
| **DevOps**   | Docker, Docker Compose, Nginx, GitHub Actions                                          |

---

## 📁 Project Structure

```text
devlens-lite/
├── backend/              # Node.js + Express API
├── frontend/             # React + Vite frontend
├── docker/               # Nginx configuration
├── scripts/              # Setup scripts
├── docs/                 # Documentation
└── docker-compose.yml    # Docker services configuration
```

---

## 🚀 Quick Start with Docker

### 1. Clone the repository

```bash
git clone https://github.com/Aditee26/devlens-lite.git
cd devlens-lite
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Update `.env` with your MongoDB connection string and JWT secret.

A Gemini API key is optional.

### 3. Start the application

```bash
docker compose up --build
```

### 4. Open the application

```text
http://localhost:3000
```

---

## 💻 Local Development

### Backend

```bash
cd backend
npm install
cp ../.env.example .env
npm run dev
```

Backend runs on:

```text
http://localhost:4000
```

### Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

### MongoDB

DevLens requires MongoDB. You can use a local MongoDB installation or run MongoDB with Docker:

```bash
docker run -d \
  -p 27017:27017 \
  --name devlens-mongo \
  mongo:7
```

---

## ⚙️ Environment Variables

Create a `.env` file using `.env.example`.

| Variable         | Required | Description                            |
| ---------------- | -------- | -------------------------------------- |
| `NODE_ENV`       | No       | `development` or `production`          |
| `PORT`           | No       | Backend port. Default: `4000`          |
| `MONGO_URI`      | Yes      | MongoDB connection string              |
| `JWT_SECRET`     | Yes      | Secret used to sign JWT tokens         |
| `JWT_EXPIRES_IN` | No       | Token lifetime. Default: `7d`          |
| `GEMINI_API_KEY` | No       | Enables Gemini-powered AI chat         |
| `GITHUB_TOKEN`   | No       | Increases GitHub API rate limits       |
| `CLONE_DIR`      | Yes      | Directory used for cloned repositories |
| `CLIENT_URL`     | Yes      | Frontend URL used for CORS             |
| `VITE_API_URL`   | Yes      | Backend API URL used by the frontend   |

### Generate a JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🔌 API

Base API path:

```text
/api/v1
```

Health check:

```text
GET /api/health
```

### Authentication

| Method | Endpoint         | Description      |
| ------ | ---------------- | ---------------- |
| POST   | `/auth/register` | Register a user  |
| POST   | `/auth/login`    | Login            |
| GET    | `/auth/me`       | Get current user |
| PATCH  | `/auth/profile`  | Update profile   |
| PATCH  | `/auth/password` | Change password  |

### Repositories

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| GET    | `/repositories`             | List repositories      |
| POST   | `/repositories`             | Import a repository    |
| GET    | `/repositories/:id`         | Get repository details |
| DELETE | `/repositories/:id`         | Delete repository      |
| POST   | `/repositories/:id/analyze` | Start analysis         |
| GET    | `/repositories/:id/status`  | Get analysis status    |

### Analysis

| Method | Endpoint                       | Description             |
| ------ | ------------------------------ | ----------------------- |
| GET    | `/analysis/repository/:repoId` | Get repository analysis |
| GET    | `/analysis/:id`                | Get analysis by ID      |

### AI Chat

| Method | Endpoint                     | Description         |
| ------ | ---------------------------- | ------------------- |
| GET    | `/chat/repository/:repoId`   | Get repository chat |
| POST   | `/chat/sessions`             | Create chat session |
| GET    | `/chat/sessions/:id`         | Get chat session    |
| DELETE | `/chat/sessions/:id`         | Delete chat session |
| POST   | `/chat/sessions/:id/message` | Send a message      |

### Reports

| Method | Endpoint                | Description       |
| ------ | ----------------------- | ----------------- |
| GET    | `/reports`              | List reports      |
| POST   | `/reports`              | Generate a report |
| GET    | `/reports/:id/download` | Download report   |
| DELETE | `/reports/:id`          | Delete report     |

All endpoints except user registration and login require a Bearer token.

---

## 🔄 How DevLens Works

```text
GitHub Repository URL
        ↓
Clone Repository
        ↓
Analyze Codebase
        ↓
Detect Technologies
        ↓
Calculate Metrics
        ↓
Build Dependency Graph
        ↓
Generate Repository Summary
        ↓
AI Assistant + Reports
```

---

## 🐳 Docker Architecture

DevLens can be run as a containerized application using Docker Compose.

```text
              ┌─────────────────┐
              │     Browser     │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │      Nginx      │
              │ Reverse Proxy   │
              └───────┬─────────┘
                      │
             ┌────────┴────────┐
             ▼                 ▼
      ┌─────────────┐   ┌─────────────┐
      │   React     │   │   Express   │
      │  Frontend   │   │   Backend   │
      └─────────────┘   └──────┬──────┘
                               │
                       ┌───────┴────────┐
                       ▼                ▼
                ┌────────────┐   ┌────────────┐
                │  MongoDB   │   │  Gemini AI │
                └────────────┘   └────────────┘
```

---

## 🌐 Deployment

The application can be deployed with:

* **Frontend:** Netlify
* **Backend:** Render
* **Database:** MongoDB Atlas
* **Containerization:** Docker / Docker Compose
* **Reverse Proxy:** Nginx
* **CI/CD:** GitHub Actions

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for deployment instructions.

---

## 🎯 Use Cases

DevLens Lite is useful for:

* Understanding unfamiliar GitHub repositories
* Quickly onboarding onto existing projects
* Exploring project architecture
* Finding dependencies and imports
* Getting an overview of large codebases
* Asking natural-language questions about code
* Generating project analysis reports

---

## 📌 Future Improvements

* Private GitHub repository support
* More programming language analyzers
* Improved code-level dependency mapping
* Persistent AI conversation context
* Repository comparison
* Advanced architecture visualizations
* Pull request analysis

---

## 📄 License

This project is licensed under the **MIT License**.

© DevLens Lite
