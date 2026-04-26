#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUN_BACKEND=true
RUN_FRONTEND=true

usage() {
  cat <<'USAGE'
Usage: ./sanghathi-Frontend/scripts/run-all-tests.sh [--backend|--frontend|--all]

Options:
  --backend   Run only backend tests
  --frontend  Run only frontend tests
  --all       Run both backend and frontend tests (default)
  -h, --help  Show this help message
USAGE
}

if [[ $# -gt 0 ]]; then
  case "$1" in
    --backend)
      RUN_BACKEND=true
      RUN_FRONTEND=false
      ;;
    --frontend)
      RUN_BACKEND=false
      RUN_FRONTEND=true
      ;;
    --all)
      RUN_BACKEND=true
      RUN_FRONTEND=true
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

if [[ "$RUN_BACKEND" == true ]]; then
  echo "[tests] Running backend tests..."
  (
    cd "$ROOT_DIR/sanghathi-Backend"
    bun run test -- --runInBand
  )
fi

if [[ "$RUN_FRONTEND" == true ]]; then
  echo "[tests] Running frontend tests..."
  (
    cd "$ROOT_DIR/sanghathi-Frontend"
    bun run test
  )
fi

echo "[tests] Done."
