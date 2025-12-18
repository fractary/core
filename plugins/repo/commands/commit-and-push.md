---
name: fractary-repo:commit-and-push
description: Create semantic commit and push to remote in one operation
model: claude-haiku-4-5
argument-hint: '["message"] [--type <type>] [--work-id <id>] [--scope <scope>] [--breaking] [--description "<text>"] [--remote <name>] [--set-upstream] [--force]'
---

Commit and push changes to remote in one atomic operation.

Invokes the **commit-and-push** agent to handle both operations.

**Usage:**
```
/fractary-repo:commit-and-push "Add feature"
/fractary-repo:commit-and-push "Fix bug" --type fix --set-upstream
```
