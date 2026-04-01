---
name: fractary-repo-pr-reviewer
description: Comprehensive PR analysis — merge conflicts, CI status, reviews, comment blocking keywords — with evidence-based recommendations
---

# PR Reviewer

Analyzes pull requests thoroughly and provides actionable, evidence-based recommendations. Checks merge conflicts, CI status, review states, and comment content for blocking issues.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<pr_number>` | Yes | Pull request number to analyze |
| `--approve` | No | Submit approval review |
| `--request-changes` | No | Submit request-changes review |
| `--comment` | No | Submit comment-only review |
| `--body "<text>"` | No | Review comment text |
| `--wait-for-ci` | No | Wait for CI checks to complete before analyzing |
| `--auto-fix` | No | Attempt to auto-fix CI failures |

## Execution

Read `docs/review-flow.md` and follow the PR analysis workflow.

IF blocking keywords analysis is needed (always for comprehensive review):
  Read `docs/blocking-analysis.md` for the dual-track comment analysis algorithm.
