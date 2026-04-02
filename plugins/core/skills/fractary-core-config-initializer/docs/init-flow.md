# Config Initialization Flow

## Critical Rules
1. ALWAYS use the CLI (`fractary-core config configure`) for config generation
2. NEVER manually construct YAML for fresh setups
3. ALWAYS detect platforms and project info from git remote or ask user
4. NEVER store tokens directly in config - use `${ENV_VAR}` syntax
5. ALWAYS present proposed changes BEFORE applying and get user confirmation (unless --yes)
6. ONLY create config for the 5 core plugins: work, repo, logs, file, docs
7. NEVER create `codex` or `faber` sections - those are managed by their own plugins
8. When arguments are NOT provided, ALWAYS auto-detect/guess values and confirm with user via AskUserQuestion — do NOT fail or prompt user to re-run with arguments
9. NEVER ask the user questions via plain text output — MUST use AskUserQuestion tool

## Step 1: Auto-Detect Project Context

```bash
git remote get-url origin 2>/dev/null
ls -la .fractary/config.yaml 2>/dev/null
ls -la .env .env.* 2>/dev/null
```

Parse git remote URL to extract:
- **Platform**: github.com → github, gitlab.com → gitlab, bitbucket.org → bitbucket
- **Owner/Org**: organization or user name
- **Repo**: repository name

## Step 2: Smart Detection & User Confirmation

For each critical value NOT explicitly provided as an argument, auto-detect and confirm via AskUserQuestion.

### Round 1: Core Settings
Batch all non-dependent questions into a single AskUserQuestion call:

- **Project Identity** (if --owner/--repo not provided): "Detected project: {owner}/{repo} — Is this correct?"
- **Work Platform** (if --work-platform not provided): "Which platform for work/issue tracking?" (mark detected as Recommended)
- **Repository Platform** (if --repo-platform not provided): "Which repository platform?" (mark detected as Recommended)
- **File Storage** (if --file-handler not provided): "Where should files be stored?" (Local = Recommended)

### Round 2: Platform-Specific Follow-ups
Based on Round 1 answers:
- **If S3 selected**: Ask bucket name (default: `dev.{repo}`) and AWS region
- **If Jira selected**: Ask Jira project key
- **If Linear selected**: Ask Linear team key

### When --yes is Set
Skip AskUserQuestion calls, use auto-detected values. Fall back to defaults if detection fails.

## Step 3: Generate Configuration via CLI

```bash
fractary-core config configure \
  --work-platform {work_platform} \
  --file-handler {file_handler} \
  --owner {owner} \
  --repo {repo} \
  [--s3-bucket {bucket} --aws-region {region}] \
  --force
```

## Step 4: Create Supporting Files

```bash
mkdir -p logs logs/templates docs docs/templates docs/specs
fractary-core config env-init
fractary-core config env-section-write fractary-core \
  --file .fractary/env/.env.example \
  --set "GITHUB_TOKEN=ghp_your_token_here" \
  --set "# AWS_ACCESS_KEY_ID=" \
  --set "# AWS_SECRET_ACCESS_KEY=" \
  --set "# AWS_DEFAULT_REGION=us-east-1" \
  --set "# JIRA_URL=" \
  --set "# JIRA_EMAIL=" \
  --set "# JIRA_TOKEN=" \
  --set "# LINEAR_API_KEY="
```

## Step 5: Create/Update .gitignore

Ensure root `.gitignore` has managed sections for archive directories:
```
# ===== fractary-logs (managed) =====
logs/_archive/
# ===== end fractary-logs =====

# ===== fractary-docs (managed) =====
docs/_archive/
# ===== end fractary-docs =====
```

## Step 6: Set Up Worktree Support

```bash
# Add .claude/worktrees/ to .gitignore
grep -q "^\.claude/worktrees/" .gitignore 2>/dev/null || echo -e "\n# Claude Code worktrees\n.claude/worktrees/" >> .gitignore

# Ensure .worktreeinclude exists with .fractary/env/.env*
if [ ! -f ".worktreeinclude" ]; then
  printf '**/.claude/settings.local.json\n.fractary/env/.env*\n' > .worktreeinclude
elif ! grep -qF '.fractary/env/.env*' .worktreeinclude; then
  echo '.fractary/env/.env*' >> .worktreeinclude
fi
```

## Step 7: Ensure .env exclusion in root .gitignore

```bash
grep -q "^\.env$" .gitignore 2>/dev/null || echo -e "\n.env\n.env.*\n!.env.example" >> .gitignore
```

## Step 8: Final Confirmation (unless --yes)

Call AskUserQuestion with summary of all resolved values. Options: "Yes, create configuration" / "No, let me change something" / "Cancel"

## Step 9: Validate

```bash
fractary-core config validate
```

## Step 10: Report Results

```
=== CONFIGURATION COMPLETE ===

Configuration: .fractary/config.yaml
Plugins configured: work ({platform}), repo ({platform}), logs, file ({handler}), docs
Project: {owner}/{repo}

Next steps:
1. Review config: fractary-core config show
2. Set credentials in .fractary/env/.env (copy from .fractary/env/.env.example)
3. Test: /fractary-work-issue-list
4. For updates: /fractary-core-config-update --context "description of changes"
```
