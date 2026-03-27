---
name: fractary-repo-pr-review
description: Review pull requests - delegates to fractary-repo-pr-review-agent
allowed-tools: Agent(fractary-repo-pr-review-agent)
model: claude-opus-4-6
argument-hint: '<pr_number> [--approve|--request-changes|--comment] [--body "<text>"] [--context "<text>"]'
---

Use **Agent** tool with `fractary-repo-pr-review-agent` agent to analyze and review pull requests.

```
Agent(
  subagent_type="fractary-repo-pr-review-agent",
  description="Review pull request",
  prompt="Analyze and review pull request: $ARGUMENTS"
)
```
