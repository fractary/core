---
name: fractary-repo:commit
description: Create semantic commits with conventional commit format and FABER metadata
model: claude-haiku-4-5
argument-hint: '["message"] [--type <type>] [--work-id <id>] [--scope <scope>] [--breaking] [--description "<text>"]'
---

Create Git commits using conventional commit format.

Invokes the **commit** agent to create semantic commits.

**Usage:**
```
/fractary-repo:commit "Add new feature"
/fractary-repo:commit "Fix auth bug" --type fix --work-id 123
/fractary-repo:commit "API changes" --type feat --breaking
```
