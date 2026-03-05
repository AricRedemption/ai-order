#!/usr/bin/env bash
set -euo pipefail
base="/root/.config/superpowers/worktrees/ai-order/feat-build-test-checks"
workflow="$base/.github/workflows/ci.yml"

rg -n '^name:\s*ci$' "$workflow" >/dev/null
rg -n '^\s{2}build:$' "$workflow" >/dev/null
rg -n '^\s{2}test:$' "$workflow" >/dev/null
rg -n 'npm run build' "$workflow" >/dev/null
rg -n 'npm run test' "$workflow" >/dev/null
rg -n '"typecheck"' "$base/package.json" >/dev/null
rg -n '"test"' "$base/package.json" >/dev/null

echo PASS
