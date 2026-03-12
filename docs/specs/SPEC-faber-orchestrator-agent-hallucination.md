# SPEC-faber-orchestrator-agent-hallucination

**Status**: Open
**Affects**: `fractary-faber` plugin (orchestration protocol)
**Discovered During**: catalog-integrate #328 architect phase (corthodex project)
**Target**: External plugin changes in `fractary-faber` repo
**Related**: SPEC-issue-skill-invocation-integrity (same failure class — orchestrator bypassing Skill tool)

---

## Summary

During the catalog-integrate #328 workflow, the FABER orchestrator committed two errors during `architect-commit-and-push`:

1. **Used Agent tool instead of Skill tool** — invoked `Agent(subagent_type="fractary-repo:branch-forward")` instead of `Skill("fractary-repo:commit-push")`
2. **Used wrong command name** — substituted `branch-forward` (from a later evaluate phase step) for `commit-push` (the actual step prompt)

The orchestrator self-corrected after the Agent error and used `Skill(fractary-repo:commit-push)` successfully. No lasting damage, but the error wasted time and tokens.

---

## Root Cause Analysis

### Primary: Orchestrator used Agent tool for a slash-command step

The plan step is:
```json
{
  "id": "architect-commit-and-push",
  "name": "Commit and Push Changes",
  "prompt": "/fractary-repo:commit-push --work-id {work_id}"
}
```

The orchestration protocol (line 24) states: "If the prompt starts with `/`, invoke it as a slash command (Skill tool)." The ANTI-PATTERN block (line 37) added after SPEC-issue-skill-invocation-integrity further states: "Do NOT call the underlying CLI directly via Bash."

However, the current anti-pattern only covers the **Bash bypass** path. The orchestrator found a new bypass path: **Agent tool**. The `fractary-repo:branch-forward` naming pattern matches agent naming conventions (e.g., `fractary-repo:pr-review-agent`), which likely contributed to the model treating it as an agent type.

### Secondary: Orchestrator read step name instead of step prompt

The invocation `Agent(subagent_type="fractary-repo:branch-forward", prompt="Commit and push architect phase changes")` shows the model used the step's **name** ("Commit and Push Changes") and **description** rather than the step's **prompt** field (`/fractary-repo:commit-push --work-id {work_id}`). It then associated "branch-forward" with the task — likely because `branch-forward` exists later in the plan (in the `evaluate-forward-to-test` step) and is conceptually related to branch operations.

### Pattern: Recurring Skill bypass class

This is the second documented instance of the orchestrator bypassing Skill tool:

| Incident | Bypass method | What happened |
|----------|---------------|---------------|
| SPEC-issue-skill-invocation-integrity (WORK-192) | Bash | Orchestrator called CLI directly via Bash, dropping `--repo` arg |
| This incident (#328) | Agent | Orchestrator called Agent tool with wrong command name |

The existing anti-pattern block (added after WORK-192) prevented the Bash bypass path but did not anticipate the Agent bypass path.

---

## Required Changes

### Part 1: Add Agent/Task bypass anti-pattern

**File:** `plugins/faber/docs/workflow-orchestration-protocol.md`

After the existing ANTI-PATTERN block (line ~42), add:

```markdown
> **ANTI-PATTERN: Never invoke step prompts via Agent/Task tool.**
>
> Slash command steps MUST go through `Skill` tool, not `Agent` tool. Commands are skills, not agents.
> If a command internally delegates to an agent (e.g., `/fractary-repo:pr-review` invokes
> `fractary-repo:pr-review-agent` via Task), the Skill handles that delegation transparently.
> The orchestrator NEVER calls Agent/Task directly for step execution.
>
> The naming pattern `fractary-*:*` does NOT imply an agent type. Most `fractary-*:*` names
> are skills (commands), not agents. Only names explicitly ending in `-agent` are agent types.
```

### Part 2: Add prompt-field-verbatim reminder

**File:** `plugins/faber/docs/workflow-orchestration-protocol.md`

In the EXECUTE step section (near line 182, before the dispatch `if` block), add:

```markdown
> **CRITICAL: Execute the step's `prompt` field verbatim.**
>
> Read `step.prompt` literally before invoking. Do NOT substitute it with the step's `name`
> or `description`. Do NOT use a command from a different phase or step. The `prompt` field
> is the sole authoritative instruction for what to execute.
```

### Part 3: Update workflow-run.md critical rules

**File:** `plugins/faber/commands/workflow-run.md`

Add a new CRITICAL_RULE alongside the existing #12 (NEVER BYPASS SKILLS):

```
CRITICAL_RULE #13: NEVER USE AGENT FOR SLASH COMMANDS
When executing a step whose prompt starts with `/`, ALWAYS use Skill tool.
NEVER use Agent tool with a fractary-*:* name — those are skills, not agents.
Read the step's `prompt` field literally. Do not use the step's name or description
as the command to execute.
```

---

## Files Changed

| Project | File | Change |
|---------|------|--------|
| fractary-faber | `plugins/faber/docs/workflow-orchestration-protocol.md` | Add Agent/Task anti-pattern block + prompt-verbatim reminder |
| fractary-faber | `plugins/faber/commands/workflow-run.md` | Add CRITICAL_RULE #13 |

No changes to workflow definitions, core.json, or code in fractary-core.

---

## Verification

1. Run a FABER workflow through the architect phase — confirm `architect-commit-and-push` uses `Skill(fractary-repo:commit-push)` and NOT `Agent(fractary-repo:*)`
2. Run through the evaluate phase — confirm `evaluate-forward-to-test` uses `Skill(fractary-repo:branch-forward)` (not Agent)
3. Grep orchestrator logs for `Agent(subagent_type="fractary-` to detect any remaining bypass patterns
