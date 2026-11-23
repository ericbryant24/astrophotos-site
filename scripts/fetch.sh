#!/usr/bin/env bash
# One-time helper run by GitHub Actions to copy the photos off Azure.
set -euo pipefail
base=https://astrophotos.blob.core.windows.net
mkdir -p media resources
python3 -c "import json;[print(e['file']) for e in json.load(open('data/media.json'))]" | while IFS= read -r f; do
  enc=$(python3 -c "import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))" "$f")
  curl -sSf --retry 3 -o "media/$f" "$base/media/$enc"
done
for r in telescope_favicon_32x32.png stars-bg.png seestar.png; do
  curl -sSf --retry 3 -o "resources/$r" "$base/resources/$r"
done
ls -la media resources
