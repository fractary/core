# Dual-Track Comment Blocking Analysis

## Track 1: CI Bot Comments
1. Collect all comments from `comments` array and `reviews[].body`
2. Filter CI bot comments using identification patterns (see below)
3. Sort by `createdAt` (newest first)
4. Take ONLY the most recent CI bot comment
5. Search for blocking keywords
6. Extract structured issues if found

## Track 2: Human Comments
1. Filter non-CI-bot comments
2. Sort by timestamp (most recent first)
3. Find most recent substantial comment (>50 chars, not "LGTM")
4. Search for blocking keywords
5. Apply context clues to determine if truly blocking
6. Extract structured issues from numbered/bullet lists

## Merged Result
Blocking keywords in EITHER track triggers P1. Report CI and human issues separately.

## CI Bot Identification (case-insensitive)
- `github-actions` — GitHub Actions workflows
- Names ending in `-bot` — automation bots
- Names ending in `[bot]` — GitHub Apps
- `dependabot`, `renovate` — dependency update bots
- `codecov`, `sonarcloud` — code quality bots

## Blocking Keywords (case-insensitive)
- Critical: "critical issue", "critical bug", "critical problem"
- Blocking: "blocking", "blocker", "blocks"
- Must Fix: "must fix", "need to fix", "needs to be fixed"
- Security: "security issue", "security vulnerability", "security risk"
- Approval: "do not approve", "don't approve", "not ready"
- Failures: "fails", "failing", "failed"
- Breakage: "broken", "breaks", "breaking"
- Code Issues: "memory leak", "race condition", "deadlock", "incorrect", "wrong", "error", "bug"

## Context Clues
- "before approving" / "before merge" → Issues ARE blocking
- "nice to have" / "optional" / "future improvement" → NOT blocking
- Comment from PR author → Usually addressing feedback, NOT blocking
- Reply in resolved thread → Likely NOT blocking
