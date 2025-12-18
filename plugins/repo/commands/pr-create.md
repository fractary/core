---
name: fractary-repo:pr-create
description: Create a new pull request
model: claude-haiku-4-5
argument-hint: '"<title>" [--body "<text>"] [--prompt "<instructions>"] [--base <branch>] [--head <branch>] [--work-id <id>] [--draft]'
---

Create a pull request for the current branch.

Invokes the **pr-create** agent to handle PR creation.

**Usage:**
```
/fractary-repo:pr-create "Add new feature"
/fractary-repo:pr-create "Fix bug" --base main --draft
/fractary-repo:pr-create "Feature" --work-id 123
```
