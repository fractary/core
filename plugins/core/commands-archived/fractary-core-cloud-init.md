---
name: fractary-core-cloud-init
description: Initialize cloud storage for file handlers (upgrade from local to S3 or R2)
allowed-tools: Skill(fractary-core-cloud-initializer), Bash, Read, Edit, Write, Glob, AskUserQuestion
model: claude-haiku-4-5
argument-hint: '[--provider <s3|r2>] [--bucket <name>] [--region <region>] [--account-id <id>] [--scope <archives|all>] [--terraform] [--migrate] [--yes]'
---

Use the **Skill** tool with `fractary-core-cloud-initializer` to initialize cloud storage.

Walks through upgrading file storage from local to a cloud provider (S3 or R2).
Prerequisites: Project must already have a base configuration. Run `/fractary-core-config-init` first if no configuration exists.

```
Skill(
  skill="fractary-core-cloud-initializer",
  args="$ARGUMENTS"
)
```
