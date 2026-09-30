#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: bash manage.sh [--check | --up | --status] [--directory PATH]

  --check       Validate the actual configuration only (default).
  --up          Validate, then run docker compose up -d.
  --status      Validate, then show docker compose ps --all.
  --directory   Deployment directory; defaults to this script's directory.

Requires Docker Compose v2+ and Python 3. Does not copy configuration, generate
secrets, back up data, migrate data, or remove containers/volumes.
USAGE
}

deployment_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
mode=--check
mode_set=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --check|--up|--status)
      if [[ "$mode_set" == true ]]; then
        echo 'Choose only one of --check, --up, and --status.' >&2
        exit 2
      fi
      mode="$1"
      mode_set=true
      shift
      ;;
    --directory)
      [[ $# -ge 2 && -n "$2" ]] || { usage >&2; exit 2; }
      deployment_dir="$2"
      shift 2
      ;;
    --help|-h) usage; exit 0 ;;
    *) usage >&2; exit 2 ;;
  esac
done

deployment_dir="$(cd -- "$deployment_dir" && pwd)"
for file in compose.yaml .env appsettings.json; do
  [[ -f "$deployment_dir/$file" ]] || {
    echo "Missing $file in deployment directory. Read README.md before preparing actual configuration." >&2
    exit 1
  }
done
command -v docker >/dev/null || { echo 'Docker CLI is required.' >&2; exit 1; }
command -v python3 >/dev/null || { echo 'Python 3 is required.' >&2; exit 1; }

compose=(docker compose --project-name nkisa-ctf
  --project-directory "$deployment_dir"
  --env-file "$deployment_dir/.env"
  --file "$deployment_dir/compose.yaml")

# Render into a pipe, never into a file or terminal: resolved config contains secrets.
"${compose[@]}" config --format json | python3 -c '
import json
import pathlib
import sys

def require_value(value, label):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(label + " must be a non-empty string")
    if "REPLACE_WITH_" in value:
        raise ValueError(label + " still contains a template placeholder")

try:
    rendered = json.load(sys.stdin)
    settings_path = pathlib.Path(sys.argv[1]) / "appsettings.json"
    settings = json.loads(settings_path.read_text(encoding="utf-8"))
    services = rendered["services"]
    require_value(services["db"]["environment"]["POSTGRES_PASSWORD"], "POSTGRES_PASSWORD")
    require_value(services["gzctf"]["environment"]["GZCTF_ADMIN_PASSWORD"], "GZCTF_ADMIN_PASSWORD")
    require_value(settings["ConnectionStrings"]["Database"], "ConnectionStrings.Database")
    require_value(settings["XorKey"], "XorKey")
except ValueError as error:
    if isinstance(error, json.JSONDecodeError):
        sys.exit("Invalid JSON in Compose output or appsettings.json.")
    sys.exit(str(error))
except (OSError, KeyError, TypeError):
    sys.exit("Cannot read required configuration fields; check the example structure.")
print("Configuration parsed; required secret fields are set. Values were not printed.")
' "$deployment_dir"

case "$mode" in
  --check)
    echo 'No container operation performed. Confirm database password agreement and proxy address before --up.'
    ;;
  --up)
    for directory in data/db data/files; do
      [[ -d "$deployment_dir/$directory" ]] || {
        echo "Missing $directory; verify the deployment path and restore or prepare data manually before --up." >&2
        exit 1
      }
    done
    "${compose[@]}" up -d
    ;;
  --status) "${compose[@]}" ps --all ;;
esac
