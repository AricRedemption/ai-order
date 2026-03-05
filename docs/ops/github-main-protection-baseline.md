# GitHub Main Protection Baseline

Target branch: `main`

## Required settings

1. Require a pull request before merging
2. Require status checks to pass before merging
3. Require conversation resolution before merging
4. Require merge queue
5. Block force pushes
6. Block branch deletion

## Required checks

- `reviewer-gate`
- `build`
- `test`

If your CI uses different job names, update required checks with actual workflow job names.

## Branch naming policy

Use a ruleset with this pattern:

```regex
^(feat|fix|chore|refactor|docs|test|perf|ci|build|revert)\/[a-z0-9]+(?:-[a-z0-9]+)*$
```

## Notes

- Keep role ownership in PR labels, not branch names.
- For high-risk PRs, require explicit manual approval before merge.
