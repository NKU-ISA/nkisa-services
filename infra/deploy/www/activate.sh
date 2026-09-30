#!/usr/bin/env bash
# Run from a prepared package on the Ubuntu server. Does not change Nginx.
set -Eeuo pipefail
die() { printf '%s\n' "$*" >&2; exit 1; }
[ "$(id -u)" -eq 0 ] || die 'Run with sudo on the server.'
[ "$#" -eq 1 ] || die 'Usage: sudo bash activate.sh <expected-current-release-path>'
expected_previous=$1
source_dir=$(cd -- "$(dirname -- "$0")" && pwd)
release_id=$(cat "$source_dir/release-id")
[[ "$release_id" =~ ^[0-9]{8}T[0-9]{6}Z$ ]] || die 'Invalid release ID.'
base=/var/www/nkisa
release_dir="$base/releases/$release_id"
backup_dir="/var/backups/nkisa/www/$release_id"
[ -d "$base/releases" ] || die 'Existing homepage installation is required.'
exec 9>"$base/.deploy.lock"
flock -n 9 || die 'Another homepage deployment or rollback is running.'
[ -L "$base/current" ] || die 'current must be an existing symlink.'
previous=$(readlink -- "$base/current")
[ "$previous" = "$expected_previous" ] || die 'Active release changed; inspect before publishing.'
[[ "$previous" =~ ^/var/www/nkisa/releases/[0-9]{8}T[0-9]{6}Z$ ]] || die 'Unexpected current release path.'
[ -d "$previous" ] || die 'Previous release directory is missing.'
[ ! -e "$release_dir" ] && [ ! -L "$release_dir" ] || die 'Release already exists.'
[ ! -e "$backup_dir" ] || die 'Backup directory already exists.'
[ -f "$source_dir/site/index.html" ] || die 'Prepared index.html is missing.'
[ -s "$source_dir/site.sha256" ] || die 'Prepared checksum manifest is missing.'
if [ -n "$(find "$source_dir/site" -type l -print -quit)" ]; then
  die 'Symlinks are not allowed in the prepared site.'
fi
# Reject paths that could escape the release or be interpreted as URL parameters.
while read -r digest relative; do
  [[ "$digest" =~ ^[0-9a-f]{64}$ ]] || die 'Invalid checksum.'
  [[ "$relative" =~ ^[A-Za-z0-9_./-]+$ ]] || die 'Invalid manifest path.'
  case "/$relative/" in */../*|*/./*|//* ) die 'Unsafe manifest path.' ;; esac
done < "$source_dir/site.sha256"
(cd "$source_dir/site" && sha256sum --check "$source_dir/site.sha256")
nginx -t

temporary_release=$(mktemp -d "$base/releases/.prepare-$release_id-XXXXXX")
temporary_link="$base/.current-$release_id-$$"
changed=0
cleanup() {
  status=$?
  trap - EXIT
  if [ "$status" -ne 0 ] && [ "$changed" -eq 1 ]; then
    if [ -L "$base/current" ] && [ "$(readlink -- "$base/current")" = "$release_dir" ]; then
      ln -s -- "$previous" "$temporary_link"
      mv -Tf -- "$temporary_link" "$base/current"
      printf '%s\n' 'Verification failed; previous homepage release restored.' >&2
    else
      printf '%s\n' 'Active release changed; manual inspection is required.' >&2
    fi
  fi
  rm -f -- "$temporary_link"
  rm -rf -- "$temporary_release"
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
cp -a -- "$source_dir/site/." "$temporary_release/"
chown -R root:root "$temporary_release"
chmod -R u=rwX,go=rX "$temporary_release"
(cd "$temporary_release" && sha256sum --check "$source_dir/site.sha256")
mv -T -- "$temporary_release" "$release_dir"
install -d -m 0700 "$backup_dir"
printf '%s\n' "$previous" > "$backup_dir/previous-target"
printf '%s\n' "$release_dir" > "$backup_dir/deployed-target"
install -m 0600 "$source_dir/site.sha256" "$backup_dir/site.sha256"
install -m 0600 "$source_dir/release.json" "$backup_dir/release.json"
install -m 0700 "$source_dir/rollback.sh" "$backup_dir/rollback.sh"
ln -s -- "$release_dir" "$temporary_link"
changed=1
mv -Tf -- "$temporary_link" "$base/current"

# Existing Nginx points at current; switching the link does not require a reload.
while read -r expected relative; do
  request_path="/$relative"
  [ "$relative" != index.html ] || request_path=/
  actual=$(curl --fail --silent --show-error --connect-timeout 5 --max-time 20 \
    --resolve www.nkisa.com:443:127.0.0.1 "https://www.nkisa.com$request_path" | sha256sum | cut -d ' ' -f 1)
  [ "$actual" = "$expected" ] || die "Published checksum mismatch: $relative"
done < "$source_dir/site.sha256"
changed=0
printf '%s\n' 'Published: https://www.nkisa.com/' "Release: $release_dir" \
  "Rollback: sudo bash $backup_dir/rollback.sh"
