#!/usr/bin/env bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ____  _______     ___                    _     _ _       "
echo " |  _ \\| ____\\ \\   / / |    ___ _ __  ___ | |   (_) |_ ___ "
echo " | | | |  _|  \\ \\ / /| |   / _ \\ '_ \\/ __|| |   | | __/ _ \\"
echo " | |_| | |___  \\ V / | |__|  __/ | | \\__ \\| |___| | ||  __/"
echo " |____/|_____|  \\_/  |_____|\___|_| |_|___/|_____|_|\\__\\___|"
echo -e "${NC}"
echo -e "${GREEN}DevLens Lite – Local Setup${NC}"
echo ""

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ── Check prerequisites ────────────────────────────────────────────────────────
echo -e "${YELLOW}Checking prerequisites…${NC}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed.${NC}"; exit 1; }
command -v npm  >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed.${NC}"; exit 1; }
echo -e "  ✅ Node $(node -v)"
echo -e "  ✅ npm  $(npm -v)"

# ── Copy env ───────────────────────────────────────────────────────────────────
if [ ! -f "$ROOT/.env" ]; then
  cp "$ROOT/.env.example" "$ROOT/.env"
  echo -e "  📋 Created .env from .env.example"
  echo -e "  ${YELLOW}⚠  Edit .env and add your GEMINI_API_KEY before starting${NC}"
fi

if [ ! -f "$ROOT/backend/.env" ]; then
  cp "$ROOT/.env" "$ROOT/backend/.env"
fi

# ── Install backend ────────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Installing backend dependencies…${NC}"
cd "$ROOT/backend" && npm install
echo -e "  ✅ Backend packages installed"

# ── Install frontend ───────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Installing frontend dependencies…${NC}"
cd "$ROOT/frontend" && npm install
echo -e "  ✅ Frontend packages installed"

# ── Create repo clone dir ──────────────────────────────────────────────────────
mkdir -p /tmp/repos
echo -e "  ✅ Clone directory /tmp/repos ready"

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "To start the application:"
echo ""
echo -e "  ${CYAN}# Terminal 1 – start MongoDB (if not using Docker)${NC}"
echo -e "  mongod"
echo ""
echo -e "  ${CYAN}# Terminal 2 – start backend${NC}"
echo -e "  cd backend && npm run dev"
echo ""
echo -e "  ${CYAN}# Terminal 3 – start frontend${NC}"
echo -e "  cd frontend && npm run dev"
echo ""
echo -e "  ${CYAN}# OR use Docker Compose (recommended)${NC}"
echo -e "  docker compose up --build"
echo ""
echo -e "  Frontend → ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend  → ${GREEN}http://localhost:4000${NC}"
echo -e "  API docs → ${GREEN}http://localhost:4000/api/health${NC}"
echo ""
