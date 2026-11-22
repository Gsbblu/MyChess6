#!/usr/bin/env python3
"""Reject cloud data that could hit GitHub's per-file size limit."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CLOUD_DATA = ROOT / "cloud-data"
MAX_FILE_BYTES = 5 * 1024 * 1024


def main() -> None:
    oversized = [
        (path, path.stat().st_size)
        for path in CLOUD_DATA.rglob("*")
        if path.is_file() and path.stat().st_size > MAX_FILE_BYTES
    ]
    if oversized:
        details = ", ".join(f"{path.relative_to(ROOT)} ({size} bytes)" for path, size in oversized)
        raise SystemExit(f"Cloud data excede o limite interno de {MAX_FILE_BYTES} bytes: {details}")

    manifest_path = CLOUD_DATA / "index.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        for shard in manifest.get("shards", []):
            name = shard.get("path", "")
            if not isinstance(name, str) or Path(name).name != name:
                raise SystemExit(f"Nome de shard inválido no índice: {name!r}")
            path = CLOUD_DATA / "shards" / name
            if not path.is_file():
                raise SystemExit(f"Shard listado no índice não existe: {path.relative_to(ROOT)}")
            if path.stat().st_size != shard.get("bytes"):
                raise SystemExit(f"Tamanho divergente no índice: {path.relative_to(ROOT)}")

    print("Cloud data dentro do limite de tamanho do GitHub.")


if __name__ == "__main__":
    main()
