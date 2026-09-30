#!/usr/bin/env python3
"""Build and package the homepage locally; never connects to the server."""

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--release-id", help="UTC release ID, e.g. 20261001T120000Z")
    args = parser.parse_args()
    release_id = args.release_id or datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    if not re.fullmatch(r"\d{8}T\d{6}Z", release_id):
        parser.error("release ID must have the format YYYYMMDDTHHMMSSZ")

    script_dir = Path(__file__).resolve().parent
    repo = script_dir.parents[2]
    project = repo / "www"
    packages = script_dir / ".releases"
    destination = packages / release_id
    if destination.exists():
        parser.error(f"release already exists: {destination}")

    subprocess.run(["npm", "run", "lint"], cwd=project, check=True)
    subprocess.run(["npm", "run", "build"], cwd=project, check=True)
    dist = project / "dist"
    if not (dist / "index.html").is_file():
        raise SystemExit("build did not produce dist/index.html")
    # Keep manifests and URL checks unambiguous, and avoid packaging outside files.
    files = sorted(path for path in dist.rglob("*") if not path.is_dir())
    for path in dist.rglob("*"):
        if path.is_symlink():
            raise SystemExit(f"symlinks are not allowed in dist: {path}")
    for path in files:
        relative = path.relative_to(dist).as_posix()
        if not path.is_file() or not re.fullmatch(r"[A-Za-z0-9_./-]+", relative):
            raise SystemExit(f"unsupported build file: {relative}")

    packages.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix=".prepare-", dir=packages))
    try:
        shutil.copytree(dist, staging / "site")
        manifest = "".join(
            f"{hashlib.sha256(path.read_bytes()).hexdigest()}  {path.relative_to(dist).as_posix()}\n"
            for path in files
        )
        (staging / "site.sha256").write_text(manifest)
        (staging / "release-id").write_text(release_id + "\n")
        (staging / "release.json").write_text(json.dumps({
            "release": release_id,
            "url": "https://www.nkisa.com/",
            "files": len(files),
            "source": "www/",
        }, indent=2) + "\n")
        for name in ("activate.sh", "rollback.sh"):
            shutil.copy2(script_dir / name, staging / name)
        staging.rename(destination)
    except BaseException:
        shutil.rmtree(staging, ignore_errors=True)
        raise
    print(f"Prepared locally: {destination}\nFiles: {len(files)}\nNo server changes made.")


if __name__ == "__main__":
    main()
