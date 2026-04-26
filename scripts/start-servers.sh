#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE="both"
BACKEND_PID=""
FRONTEND_PID=""

usage() {
  cat <<'USAGE'
Usage: ./sanghathi-Frontend/scripts/start-servers.sh [--backend|--frontend|--both]

Options:
  --backend   Start only backend server (bun run dev)
  --frontend  Start only frontend server (bun run dev)
  --both      Start both backend and frontend servers (default)
  -h, --help  Show this help message
USAGE
}

if [[ $# -gt 0 ]]; then
  case "$1" in
    --backend)
      MODE="backend"
      ;;
    --frontend)
      MODE="frontend"
      ;;
    --both)
      MODE="both"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "Bun is required but not installed. Install Bun: https://bun.sh/docs/installation" >&2
  exit 1
fi

cleanup() {
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

if [[ "$MODE" == "backend" ]]; then
  echo "[start] Starting backend server (development mode)..."
  cd "$ROOT_DIR/sanghathi-Backend"
  exec bun run dev
fi

if [[ "$MODE" == "frontend" ]]; then
  echo "[start] Starting frontend server (development mode)..."
  cd "$ROOT_DIR/sanghathi-Frontend"
  exec bun run dev
fi

echo "[start] Starting backend and frontend servers..."
(
  cd "$ROOT_DIR/sanghathi-Backend"
  bun run dev
) &
BACKEND_PID=$!

(
  cd "$ROOT_DIR/sanghathi-Frontend"
  bun run dev
) &
FRONTEND_PID=$!

echo "[start] Backend PID: $BACKEND_PID"
echo "[start] Frontend PID: $FRONTEND_PID"
echo "[start] Frontend usually runs at http://localhost:3000"

wait "$BACKEND_PID" "$FRONTEND_PID"
