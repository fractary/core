---
name: fractary-repo:pr-comment
description: Add a comment to a pull request
model: claude-haiku-4-5
argument-hint: '<pr_number> ["<comment>"] [--prompt "<instructions>"]'
---

Add a comment to a pull request.

Invokes the **pr-comment** agent to post the comment.

**Usage:**
```
/fractary-repo:pr-comment 42 "LGTM, great work!"
/fractary-repo:pr-comment 123 --prompt "Summarize the changes"
```
