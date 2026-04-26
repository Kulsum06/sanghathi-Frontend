#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

usage() {
  cat <<'USAGE'
Usage: ./sanghathi-Frontend/scripts/backup-db-atlas.sh [options]

Exports data from Atlas/source MongoDB into local backup files only.

Examples:
  ./sanghathi-Frontend/scripts/backup-db-atlas.sh
  ./sanghathi-Frontend/scripts/backup-db-atlas.sh --source-uri "mongodb+srv://..."
  ./sanghathi-Frontend/scripts/backup-db-atlas.sh --source-db cmrit --sample-size 200

Options are forwarded to:
  sanghathi-Backend/scripts/atlas-db-backup.mjs
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  echo
  cd "$ROOT_DIR/sanghathi-Backend"
  node scripts/atlas-db-backup.mjs --help
  exit 0
fi

cd "$ROOT_DIR/sanghathi-Backend"
node scripts/atlas-db-backup.mjs "$@"
