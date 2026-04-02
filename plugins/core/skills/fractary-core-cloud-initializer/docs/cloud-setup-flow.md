# Cloud Setup Flow

## Critical Rules
1. ALWAYS verify existing configuration exists before proceeding
2. ALWAYS use CLI (`fractary-core config cloud-init`) for config changes — NEVER manually construct YAML
3. ALWAYS present proposed changes and get confirmation from the user before applying
4. NEVER store credentials directly in config — use `${ENV_VAR}` syntax
5. ALWAYS offer 'archives' scope as recommended default
6. NEVER ask questions via plain text — ALWAYS prompt the user interactively
7. ALWAYS test connection after configuration is applied

## Step 1: Verify Prerequisites

```bash
fractary-core config show
fractary-core file show-config --json
```

If no config exists, inform user to run fractary-core-config-initializer first. If already cloud-backed, warn and ask if they want to reconfigure.

## Step 2: Auto-Detect Project Context

```bash
git remote get-url origin 2>/dev/null
```
Extract repo name for default bucket name (`dev.{repo}`).

## Step 3: Interactive Selection (Round 1)

Unless flags provided, prompt the user with:

**Provider Selection**: "Which cloud storage provider?" — "AWS S3 (Recommended)" / "Cloudflare R2"
**Handler Scope**: "Which handlers should use cloud?" — "Archives only (Recommended)" / "All handlers"
**Terraform**: "Generate Terraform configuration?" — "Yes, generate Terraform" / "No, I'll create the bucket myself"

## Step 4: Provider-Specific Config (Round 2)

**If S3**: Ask bucket name (default: `dev.{repo}`), AWS region (default: us-east-1)
**If R2**: Ask bucket name (default: `dev.{repo}`), Cloudflare account ID (required)

## Step 5: Final Confirmation (Round 3, unless --yes)

Present summary, get approval from the user.

## Step 6: Apply Configuration

```bash
fractary-core config cloud-init \
  --provider {provider} --bucket {bucket} \
  [--region {region}] [--account-id {accountId}] \
  --scope {scope} [--terraform] [--force]
```

## Step 7: Write Credential Templates

**For S3**:
```bash
fractary-core config env-section-write fractary-cloud \
  --file .fractary/env/.env.example \
  --set "AWS_ACCESS_KEY_ID=" --set "AWS_SECRET_ACCESS_KEY=" --set "AWS_DEFAULT_REGION={region}"
```

**For R2**:
```bash
fractary-core config env-section-write fractary-cloud \
  --file .fractary/env/.env.example \
  --set "R2_ACCOUNT_ID={accountId}" --set "R2_ACCESS_KEY_ID=" --set "R2_SECRET_ACCESS_KEY="
```

## Step 8: Generate Terraform (if requested)

Read provider-specific template from `templates/terraform/`, substitute variables, write to output directory.

## Step 9: Test Connection

```bash
fractary-core file test-connection --json
```
If credentials not set, note as expected and point user to set them.

## Step 10: Offer Migration (if --migrate or local archives exist)

```bash
fractary-core file migrate-archive --local-dir "logs/_archive" --cloud-prefix "logs/_archive" --json
fractary-core file migrate-archive --local-dir "docs/_archive" --cloud-prefix "docs/_archive" --json
```

## Step 11: Report Results

Show provider, bucket, scope, handlers updated, Terraform paths (if generated), connection status, and next steps.
