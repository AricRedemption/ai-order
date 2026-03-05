#!/usr/bin/env bash
set -euo pipefail
base="$(cd "$(dirname "$0")/../.." && pwd)"
workflow="$base/.github/workflows/ci.yml"

rg -n '^name:\s*ci$' "$workflow" >/dev/null
rg -n '^\s{2}build:$' "$workflow" >/dev/null
rg -n '^\s{2}test:$' "$workflow" >/dev/null
rg -n 'cache:\s*pnpm' "$workflow" >/dev/null
rg -n 'pnpm-lock.yaml' "$workflow" >/dev/null
rg -n 'pnpm/action-setup@' "$workflow" >/dev/null
rg -n 'pnpm install --frozen-lockfile' "$workflow" >/dev/null
rg -n 'pnpm run build' "$workflow" >/dev/null
rg -n 'pnpm run test' "$workflow" >/dev/null

echo PASS
