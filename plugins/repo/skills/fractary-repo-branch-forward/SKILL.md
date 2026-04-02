---
name: fractary-repo-branch-forward
description: Forward (merge) a source branch into a target branch via git merge. PR remains open.
---

# Branch Forward

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--source` | No | source |
| `--create-from` | No | create from |
| `--push` | No | push |
| `--json` | No | json |
| `--context` | No | context |
| `--target` | Yes | target |

## Execution

Forward (merge) a source branch into a target branch using the CLI command `fractary-core repo branch-forward`.

Examples:
- `fractary-core repo branch-forward --target test --create-from main --push --json`
- `fractary-core repo branch-forward --target staging --source feature/123 --push`

Execute in a single message. Do not use any other tools. Do not send any other text.
