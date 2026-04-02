---
name: fractary-repo-pr-review
description: Review pull requests
allowed-tools: Skill(fractary-repo-pr-reviewer), Bash, Read
model: claude-sonnet-4-6
argument-hint: '<pr_number> [--approve|--request-changes|--comment] [--body "<text>"] [--wait-for-ci] [--auto-fix]'
---

Use the **Skill** tool with `fractary-repo-pr-reviewer` to analyze and review pull requests.

```
Skill(
  skill="fractary-repo-pr-reviewer",
  args="$ARGUMENTS"
)
```
