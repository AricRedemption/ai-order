# Concurrent PR Drill

Goal: verify frontend/backend parallel PR flow with reviewer gate and merge queue.

## Steps

1. Create two PR branches from latest `main`:
- `feat/drill-ui-change`
- `feat/drill-api-change`

2. Open both PRs and attach role labels:
- `role/frontend-coder`
- `role/backend-coder`

3. For each PR, provide reviewer payload file:
- `.github/reviewer-result.json`

4. Verify checks turn green:
- `reviewer-gate`
- `build`
- `test`

5. Add both PRs into merge queue.

6. Confirm queue serializes merges and `main` stays green.

## Pass criteria

- No direct push to `main`
- Block payload (`decision=block`) prevents merge
- Two PRs merge in queue order without breaking required checks
