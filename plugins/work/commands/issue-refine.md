---
name: fractary-work:issue-refine
description: Refine issue requirements through clarifying questions
allowed-tools: Task(fractary-work:issue-refine-agent)
model: claude-opus-4-6
argument-hint: '<number> [--context "<text>"]'
---

Delegates to fractary-work:issue-refine-agent for reviewing and clarifying issue requirements.

This command reviews a GitHub issue and asks clarifying questions to ensure requirements are clear before implementation. It focuses on WHAT (requirements, goals, scope, acceptance criteria) rather than HOW (technical implementation, architecture).

Use **Task** tool with `fractary-work:issue-refine-agent` agent to refine issue requirements:

```
Task(
  subagent_type="fractary-work:issue-refine-agent",
  description="Refine issue requirements",
  prompt="Review issue requirements and ask clarifying questions to ensure clarity: $ARGUMENTS"
)
```
