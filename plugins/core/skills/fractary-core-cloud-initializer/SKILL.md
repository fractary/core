---
name: fractary-core-cloud-initializer
description: Upgrade file storage from local to cloud (S3 or R2) — handles provider selection, config, credentials, optional Terraform, and migration
---

# Cloud Storage Initializer

Guides users through upgrading file storage from local to a cloud provider. Prerequisite: base config must exist (run fractary-core-config-initializer first).

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--provider <name>` | No | Cloud provider: s3, r2 (interactive if omitted) |
| `--bucket <name>` | No | Bucket name (default: dev.{repo}) |
| `--region <region>` | No | AWS region, S3 only (default: us-east-1) |
| `--account-id <id>` | No | Cloudflare account ID, R2 only |
| `--scope <scope>` | No | Handler scope: archives (default), all |
| `--terraform` | No | Generate Terraform configuration |
| `--migrate` | No | Migrate existing local archives to cloud |
| `--yes` | No | Skip confirmation prompts |

## Execution

Read `docs/cloud-setup-flow.md` and follow the cloud setup workflow.
