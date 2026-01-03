---
name: fractary-repo:pr-review
description: Review pull requests - delegates to fractary-repo:pr-review-agent
allowed-tools: Task(fractary-repo:pr-review-agent)
model: claude-opus-4-5
argument-hint: '<pr_number> [--approve|--request-changes|--comment] [--body "<text>"] [--context "<text>"]'
---

Use **Task** tool with `fractary-repo:pr-review-agent` agent to analyze and review pull requests.

```
Task(
  subagent_type="fractary-repo:pr-review-agent",
  description="Review pull request",
  prompt="Analyze and review pull request: $ARGUMENTS"
)
```
