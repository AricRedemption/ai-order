#!/usr/bin/env bash
set -euo pipefail

input=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --input)
      input="$2"
      shift 2
      ;;
    *)
      echo "unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

if [[ -z "$input" ]]; then
  echo "missing --input" >&2
  exit 2
fi

if [[ ! -f "$input" ]]; then
  echo "input not found: $input" >&2
  exit 2
fi

schema=$(jq -r '.schemaVersion // ""' "$input")
decision=$(jq -r '.decision // ""' "$input")
severity=$(jq -r '.severity // ""' "$input")
findings_count=$(jq -r '(.findings // []) | length' "$input")

if [[ "$schema" != "reviewer_result.v1" ]]; then
  echo "invalid schemaVersion: $schema" >&2
  exit 3
fi

if [[ "$decision" != "go" && "$decision" != "block" ]]; then
  echo "invalid decision: $decision" >&2
  exit 4
fi

case "$severity" in
  none|low|medium|high|critical) ;;
  *)
    echo "invalid severity: $severity" >&2
    exit 5
    ;;
esac

if [[ "$decision" == "go" && ( "$severity" == "high" || "$severity" == "critical" ) ]]; then
  echo "high/critical severity cannot be go" >&2
  exit 6
fi

if [[ "$decision" == "block" && "$findings_count" -eq 0 ]]; then
  echo "block requires at least one finding" >&2
  exit 7
fi

if [[ "$decision" == "block" ]]; then
  echo "REVIEWER_GATE=block"
  exit 1
fi

echo "REVIEWER_GATE=go"
exit 0
