#!/usr/bin/env bash
# One-time helper run by GitHub Actions to copy content off Azure.
set -u
mkdir -p fetch && cd fetch
curl -sS -o api.js https://astrophotos.ericwbryant.com/js/api.js
for c in media resources; do
  curl -sS -o "list-$c.xml" "https://astrophotos.blob.core.windows.net/$c?restype=container&comp=list&include=metadata" || true
done
grep -o 'https\?://[^"'"'"' )`]*' api.js | sort -u > api-urls.txt || true
cat api-urls.txt
head -c 3000 list-media.xml; echo
