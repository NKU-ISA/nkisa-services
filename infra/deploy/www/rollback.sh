#!/usr/bin/env bash
# Installed beside previous-target/deployed-target by activate.sh.
set -Eeuo pipefail
die() { printf '%s\n' "$*" >&2; exit 1; }
[ "$(id -u)" -eq 0 ] || die 'Run with sudo on the server.'
backup_dir=$(cd -- "$(dirname -- "$0")" && pwd)
base=/var/www/nkisa
exec 9>"$base/.deploy.lock"
flock -n 9 || die 'Another homepage deployment or rollback is running.'
previous=$(cat "$backup_dir/previous-target")
deployed=$(cat "$backup_dir/deployed-target")
for target in "$previous" "$deployed"; do
  [[ "$target" =~ ^/var/www/nkisa/releases/[0-9]{8}T[0-9]{6}Z$ ]] || die 'Invalid release path.'
done
[ -d "$previous" ] || die 'Previous release is missing.'
[ -L "$base/current" ] || die 'current is no longer a symlink.'
[ "$(readlink -- "$base/current")" = "$deployed" ] || die 'A different release is active; inspect before rollback.'
temporary_link="$base/.rollback-$$"
trap 'rm -f -- "$temporary_link"' EXIT
ln -s -- "$previous" "$temporary_link"
mv -Tf -- "$temporary_link" "$base/current"
printf '%s\n' "Restored: $previous" 'Nginx configuration and release files were retained.'
