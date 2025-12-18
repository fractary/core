---
name: fractary-repo:pr-create
description: Create a new pull request
model: claude-haiku-4-5
argument-hint: '"<title>" [--body "<text>"] [--prompt "<instructions>"] [--base <branch>] [--head <branch>] [--work-id <id>] [--draft]'
---

Create a pull request for the current branch.

Use the **Task** tool to invoke agent `fractary-repo:pr-create`:
```
Task(
  subagent_type="fractary-repo:pr-create",
  description="Create pull request",
  prompt="Parse arguments and create PR"
)
```

**Usage:**
```
/fractary-repo:pr-create "Add new feature"
/fractary-repo:pr-create "Fix bug" --base main --draft
/fractary-repo:pr-create "Feature" --work-id 123
```
