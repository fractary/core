---
name: fractary-repo:commit
description: Create semantic commits with conventional commit format and FABER metadata
model: claude-haiku-4-5
argument-hint: '["message"] [--type <type>] [--work-id <id>] [--scope <scope>] [--breaking] [--description "<text>"]'
---

Create Git commits using conventional commit format.

Use the **Task** tool to invoke agent `fractary-repo:commit`:
```
Task(
  subagent_type="fractary-repo:commit",
  description="Create semantic commit",
  prompt="Parse arguments and create commit with conventional format"
)
```

**Usage:**
```
/fractary-repo:commit "Add new feature"
/fractary-repo:commit "Fix auth bug" --type fix --work-id 123
/fractary-repo:commit "API changes" --type feat --breaking
```
