#!/usr/bin/env bash
set -euo pipefail
base="$(cd "$(dirname "$0")/../.." && pwd)"
workflow="$base/.github/workflows/ci.yml"

rg -n '^name:\s*ci$' "$workflow" >/dev/null
rg -n '^\s{2}build:$' "$workflow" >/dev/null
rg -n '^\s{2}test:$' "$workflow" >/dev/null
rg -n 'npm run build' "$workflow" >/dev/null
rg -n 'npm run test' "$workflow" >/dev/null
if rg -n 'cache:\s*npm' "$workflow" >/dev/null; then
  echo "cache:npm requires package-lock.json, should not be used here"
  exit 1
fi
rg -n '"typecheck"' "$base/package.json" >/dev/null
rg -n '"test"' "$base/package.json" >/dev/null

echo PASS
