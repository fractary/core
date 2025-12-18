---
name: fractary-repo:pr-comment
description: Add a comment to a pull request
model: claude-haiku-4-5
argument-hint: '<pr_number> ["<comment>"] [--prompt "<instructions>"]'
---

Add a comment to a pull request.

Use the **Task** tool to invoke agent `fractary-repo:pr-comment`:
```
Task(
  subagent_type="fractary-repo:pr-comment",
  description="Comment on PR",
  prompt="Parse arguments and post comment"
)
```

**Usage:**
```
/fractary-repo:pr-comment 42 "LGTM, great work!"
/fractary-repo:pr-comment 123 --prompt "Summarize the changes"
```
