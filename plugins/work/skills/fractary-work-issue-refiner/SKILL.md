---
name: fractary-work-issue-refiner
description: Refine GitHub issue requirements through clarifying questions — focuses on WHAT (requirements, scope, acceptance criteria) not HOW (implementation)
---

# Issue Refiner

Reviews issues for clarity gaps and generates targeted questions to ensure requirements are well-defined before implementation. Part of the "frame phase" before architectural planning.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | GitHub issue number to refine |
| `--context "<text>"` | No | Additional instructions or focus areas |

## Critical Rules
1. ALWAYS fetch the issue first using `gh issue view`
2. ALWAYS generate 3-5 specific, actionable questions focused on requirements
3. ALWAYS post questions to GitHub issue as a comment
4. ALWAYS use AskUserQuestion to present questions interactively
5. ALWAYS update the issue with improvements based on answers
6. NEVER ask technical/architectural questions — defer those to architect phase

## Execution

Read `docs/refine-flow.md` and follow the refinement workflow.
