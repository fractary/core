---
name: fractary-core:cloud-init
description: Initialize cloud storage for file handlers (upgrade from local to S3 or R2)
allowed-tools: Task(fractary-core:cloud-initializer)
model: claude-haiku-4-5
argument-hint: '[--provider <s3|r2>] [--bucket <name>] [--region <region>] [--account-id <id>] [--scope <archives|all>] [--terraform] [--migrate] [--yes] [--context "<text>"]'
---

Use **Task** tool with `fractary-core:cloud-initializer` agent to initialize cloud storage.

This command walks the user through upgrading their file storage from local (set up by config-init)
to a cloud provider (S3 or R2). It handles configuration, credential setup, optional Terraform
generation, and migration of existing archives.

Prerequisites: Project must already have a base configuration (`.fractary/config.yaml`).
Run `/fractary-core:config-init` first if no configuration exists.

```
Task(
  subagent_type="fractary-core:cloud-initializer",
  description="Initialize cloud storage",
  prompt="Initialize cloud storage for file handlers: $ARGUMENTS"
)
```

Configuration is stored at: `.fractary/config.yaml` (file section)
Terraform output (if requested): `infra/terraform/`
