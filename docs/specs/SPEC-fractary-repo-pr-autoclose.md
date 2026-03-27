# SPEC-fractary-repo-pr-autoclose

**Status**: Open
**Affects**: `fractary-repo` plugin (`commit-push-pr` / `pr-create` commands)
**Discovered During**: WORK-223 release phase
**Target**: External plugin changes — no code changes in this repo

---

## Summary

PRs created via the `fractary-repo` plugin sometimes fail to auto-close their linked issue on merge.
The root cause is that the closing keyword line is either missing or formatted as markdown bold
(`**Closes:** #123`) rather than plain text (`Closes #123`). GitHub's auto-close parser requires plain
text; markdown formatting silently disables the feature.

This spec defines the fix required in the `fractary-repo` plugin so that any PR it creates
automatically bakes in the correct closing syntax when a work item ID is supplied.

---

## Problem

### GitHub auto-close requires exact plain-text syntax

GitHub closes an issue when a PR is merged if the PR body contains one of the supported closing
keywords followed by the issue reference:

```
Closes #123
Fixes #123
Resolves #123
```

These must be **plain text** on their own line (or sentence). The following formats are **NOT
recognised** and silently fail to close the issue:

| Format | Works? | Notes |
|--------|--------|-------|
| `Closes #123` | Yes | Correct |
| `Fixes #123` | Yes | Correct |
| `Resolves #123` | Yes | Correct |
| `**Closes:** #123` | **No** | Markdown bold breaks parsing |
| `**Closes #123**` | **No** | Markdown bold breaks parsing |
| `[Closes #123]` | **No** | Bracket notation not supported |
| `closes #123` (lowercase) | Yes | Case-insensitive |

### How the broken format gets introduced

When the FABER orchestrator bypasses the `/fractary-repo-commit-push-pr` Skill tool and calls
`gh pr create` directly (see SPEC-issue-skill-invocation-integrity for that failure mode), it
synthesises a PR body from context. The synthesised body often uses markdown formatting:

```markdown
**Closes:** #223
```

Even when the skill is invoked correctly, the skill itself does not currently guarantee the closing
line is present or correctly formatted. If the caller omits it from `--body`, the PR silently lacks
auto-close.

---

## Proposed Solution

### Single rule: plugin injects `Closes #{work_id}` automatically

When `--work-id` (or `--issue`) is supplied to `commit-push-pr` or `pr-create`, the plugin
**must** append the following line to the PR body before calling `gh pr create`:

```
Closes #{work_id}
```

Rules:

1. **Always injected** — The closing line is added by the plugin unconditionally when `--work-id`
   is present. The caller does not need to include it in `--body`.
2. **De-duplicated** — If the caller already included a closing keyword line in `--body` (in any
   supported format, plain or bold), the plugin replaces it with the canonical plain-text form
   rather than appending a second line.
3. **Plain text only** — The injected line MUST be `Closes #N` with no markdown formatting.
4. **Placement** — The closing line is appended at the end of the body, separated by a blank line,
   so it does not disrupt any structured sections (Summary, Test plan, etc.).
5. **Keyword** — Use `Closes` (not `Fixes` or `Resolves`) as the default. The caller may override
   the keyword via an optional `--close-keyword` argument.

### Normalisation for existing body content

Before appending, the plugin scans the body for any line matching:

```
/(\*{0,2})(closes|fixes|resolves)(\*{0,2}):?\s*#\d+/i
```

If found, that line is removed (regardless of formatting) and replaced with the canonical
`Closes #{work_id}` line at the end.

---

## Acceptance Criteria

1. A PR created via `commit-push-pr --work-id 223` contains `Closes #223` as a plain-text line
   in the body.
2. A PR created via `pr-create --work-id 223` contains `Closes #223` as a plain-text line in
   the body.
3. If the caller's `--body` already includes `**Closes:** #223`, the plugin normalises it to
   `Closes #223` (no duplicate, no bold).
4. If `--work-id` is omitted, no closing line is injected and no error is raised.
5. Merging the PR automatically closes the linked issue in GitHub.

---

## Files to Change

| Project | File | Change |
|---------|------|--------|
| fractary-repo | `plugins/repo/commands/commit-push-pr.md` | Add closing-line injection rule |
| fractary-repo | `plugins/repo/commands/pr-create.md` | Add closing-line injection rule + normalisation |

No changes to workflow definitions, standards, or code in `core.corthodex.ai`.
