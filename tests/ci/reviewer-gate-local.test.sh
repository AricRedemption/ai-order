#!/usr/bin/env bash
set -euo pipefail
base="/root/.config/superpowers/worktrees/ai-order/feat-reviewer-gate-ci"
script="$base/scripts/ci/reviewer-gate.sh"
workflow="$base/.github/workflows/reviewer-gate.yml"

bash "$script" --input "$base/tests/fixtures/reviewer-go.json" >/dev/null
if bash "$script" --input "$base/tests/fixtures/reviewer-block.json" >/dev/null 2>&1; then
  echo "expected block decision to fail"
  exit 1
fi
rg -n "name:\s*reviewer-gate" "$workflow" >/dev/null
rg -n "pull_request" "$workflow" >/dev/null
echo PASS
