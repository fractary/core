---
allowed-tools: Bash(git checkout --branch:*), Bash(git add:*), Bash(git status:*), Bash(git push:*), Bash(git commit:*), Bash(gh pr create:*), Bash(gh pr merge:*), Bash(git pull:*)
description: Commit, push, create PR, merge, and cleanup branch
model: claude-haiku-4-5
argument-hint: '[--squash|--merge|--rebase] [--context "<text>"]'
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`

## Your task

Complete the full workflow from commit to merge in a single atomic operation.

Parse arguments:
- Merge strategy: --merge (default), --squash, or --rebase
- Optional --context for additional instructions

Steps to execute:

1. Create a new branch if currently on main/master
2. Stage all changes and create a single commit with appropriate message
3. Push the branch to origin
4. Create a pull request using `gh pr create` and capture the PR URL
5. Extract the PR number from the output URL
6. Merge the PR using `gh pr merge <number> <strategy> --delete-branch`
7. Switch back to main/master branch
8. Pull latest changes from origin

Implementation notes:
- Capture PR URL: Use `gh pr create ... 2>&1 | tee /dev/stderr`
- Extract number: Parse from URL pattern `https://github.com/.*/pull/NUMBER`
- The `--delete-branch` flag in `gh pr merge` handles branch deletion
- Use base branch detection: check if current is main/master, otherwise use main as default
- All operations must execute in a single message with multiple bash tool calls

You have the capability to call multiple tools in a single response. You MUST do all of the above in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
