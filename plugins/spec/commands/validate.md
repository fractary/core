---
name: fractary-spec:validate
description: Validate specification - delegates to fractary-spec:spec-validate agent
allowed-tools: Task(fractary-spec:spec-validate)
model: claude-haiku-4-5
argument-hint: '<issue_number> [--phase <n>]'
---

Delegates to fractary-spec:spec-validate agent for validating implementation against specification.
