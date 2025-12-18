---
name: fractary-repo:pr-review
description: Analyze or review a pull request (default: analyze if no action provided)
model: claude-haiku-4-5
argument-hint: '<pr_number> [--action "analyze|approve|request_changes|comment" (default: analyze)] [--comment "<text>"] [--wait-for-ci] [--ci-timeout <seconds>]'
---

Analyze or review a pull request with approve, request changes, or comment actions.

Use the **Task** tool to invoke agent `fractary-repo:pr-review`:
```
Task(
  subagent_type="fractary-repo:pr-review",
  description="Review pull request",
  prompt="Parse arguments and review PR"
)
```

**Usage:**
```
/fractary-repo:pr-review 42
/fractary-repo:pr-review 42 --action approve
/fractary-repo:pr-review 42 --action request_changes --comment "Please add tests"
```
