---
name: fractary-repo:commit-and-push
description: Create semantic commit and push to remote in one operation
model: claude-haiku-4-5
argument-hint: '["message"] [--type <type>] [--work-id <id>] [--scope <scope>] [--breaking] [--description "<text>"] [--remote <name>] [--set-upstream] [--force]'
---

Commit and push changes to remote in one atomic operation.

Use the **Task** tool to invoke agent `fractary-repo:commit-and-push`:
```
Task(
  subagent_type="fractary-repo:commit-and-push",
  description="Commit and push",
  prompt="Parse arguments and commit then push in one operation"
)
```

**Usage:**
```
/fractary-repo:commit-and-push "Add feature"
/fractary-repo:commit-and-push "Fix bug" --type fix --set-upstream
```
