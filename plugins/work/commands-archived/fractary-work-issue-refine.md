---
name: fractary-work-issue-refine
description: Refine issue requirements through clarifying questions
allowed-tools: Skill(fractary-work-issue-refiner), Bash, Read, AskUserQuestion
model: claude-opus-4-6
argument-hint: '<number> [--context "<text>"]'
---

Use the **Skill** tool with `fractary-work-issue-refiner` to refine issue requirements.

Reviews a GitHub issue and asks clarifying questions to ensure requirements are clear before implementation. Focuses on WHAT (requirements, goals, scope, acceptance criteria) not HOW (implementation).

```
Skill(
  skill="fractary-work-issue-refiner",
  args="$ARGUMENTS"
)
```
