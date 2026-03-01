---
name: fractary-repo:commit-push-pr-review
allowed-tools: Bash(fractary-core repo branch-create:*), Bash(fractary-core repo commit:*), Bash(fractary-core repo push:*), Bash(fractary-core repo pr-create:*), Bash(gh pr view:*), Bash(gh api:*), Task(fractary-repo:pr-review-agent)
description: Commit, push, create PR, wait for CI, then run full pr-review-agent analysis
model: claude-haiku-4-5
argument-hint: '[--context "<text>"]'
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Existing PR for current branch: !`gh pr list --head $(git branch --show-current) --json number,url -q '.[0]' 2>/dev/null || echo "none"`

## Your task

**IMPORTANT: The CLI binary is `fractary-core`, NOT `fractary`. Always use `fractary-core` as the command prefix.**

Use the **Bash** tool for steps 1–6. Use the **Task** tool for step 7. Do NOT use the Skill tool.

Based on the above context:

1. If on main/master/develop, create a feature branch:
   `fractary-core repo branch-create <name> --checkout`
   Otherwise, continue on the current branch.

2. If there are uncommitted changes, create a commit:
   `fractary-core repo commit --message "<message>" --type <type> --all`

3. Push the branch to origin:
   `fractary-core repo push --set-upstream`

4. If no PR exists for this branch, create one (extract PR number from output):
   `fractary-core repo pr-create --title "<title>" --body "<body>" --json`
   If a PR already exists, use the existing PR number from context.

5. Poll every 15s for up to 15 minutes until all CI checks complete:
   `gh pr view <number> --json statusCheckRollup`
   - If all checks pass → proceed to step 6
   - If any check fails → report failures and STOP with specific error messages from the checks
   - If checks still pending after 15 minutes → STOP with timeout message

6. Delegate the PR review to the pr-review-agent:
   ```
   Task(
     subagent_type="fractary-repo:pr-review-agent",
     prompt="Analyze PR #<number>. After completing analysis, if recommendation is P3 (ready to approve), explicitly state: 'RECOMMENDATION: PROCEED WITH MERGE — run /fractary-repo:pr-merge <number>'. If blocking issues found, provide specific fix recommendations."
   )
   ```

## Output

Return either:
- A structured list of issues to fix with specific recommendations, or
- A clear "PROCEED WITH MERGE" signal with the exact merge command to run
