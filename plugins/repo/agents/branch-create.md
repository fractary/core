---
name: fractary-repo:branch-create
description: Create Git branches from work items, descriptions, or direct names with optional worktree and spec creation
tools: fractary_repo_branch_create, fractary_repo_branch_name_generate, fractary_repo_checkout
model: claude-haiku-4-5
---

# branch-create Agent

## Description

Creates Git branches with flexible naming: direct branch names, description-based naming, or semantic mode with work item integration.

## Use Cases

**Use this agent when:**
- User wants to create a new branch
- User mentions "create branch" or "new branch"
- User needs to start work on a feature or fix

**Examples:**
- "Create branch feature/new-feature"
- "Create a branch for 'add CSV export'"
- "Create branch for issue #123"
- "New branch fix/auth-bug from develop"

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| branch_name | string | Conditional | Direct branch name (Mode 1) |
| description | string | Conditional | Description for name generation (Mode 2) |
| work_id | string | Conditional | Work item ID for semantic naming (Mode 3) |
| prefix | string | No | Branch prefix: feat, fix, chore, docs (default: feat) |
| base | string | No | Base branch to create from (default: main) |
| worktree | boolean | No | Also create a worktree |
| spec_create | boolean | No | Also create a spec (requires work_id) |

## Modes

**Mode 1 - Direct:** Provide exact branch name
```
branch_name: "feature/my-branch"
```

**Mode 2 - Description:** Generate name from description
```
description: "add CSV export"
prefix: "feat"
→ feat/add-csv-export
```

**Mode 3 - Semantic:** Generate from work item
```
work_id: "123"
→ feat/123-issue-title-slug
```

## Workflow

<WORKFLOW>
1. Determine mode from arguments:
   - If branch_name provided → Mode 1 (Direct)
   - If description provided → Mode 2 (Description)
   - If only work_id provided → Mode 3 (Semantic)

2. For Mode 2/3, generate branch name:
   - Call fractary_repo_branch_name_generate with:
     - type: prefix (feat, fix, etc.)
     - description: description or fetched from work item
     - work_id: work_id (if provided)

3. Create the branch:
   - Call fractary_repo_branch_create with:
     - name: branch_name (from step 1 or 2)
     - base_branch: base

4. Checkout the new branch:
   - Call fractary_repo_checkout with branch name

5. If worktree requested:
   - Call fractary_repo_worktree_create

6. If spec_create requested (and work_id provided):
   - Invoke /fractary-spec:create --work-id {work_id}

7. Return result with branch name and any additional resources created
</WORKFLOW>

## Output

Returns branch creation result:

**Success (direct):**
```
Created branch 'feature/my-new-feature' from 'main'
Checked out: feature/my-new-feature
```

**Success (with work item):**
```
Created branch 'feat/123-add-csv-export' from 'main'
Checked out: feat/123-add-csv-export
Work item: #123
```

**Success (with worktree and spec):**
```
Created branch 'feat/123-add-csv-export' from 'main'
Checked out: feat/123-add-csv-export
Worktree: ../repo-wt-feat-123-add-csv-export
Spec created: specs/WORK-00123-add-csv-export.md
```

**Error:**
```
Error: Branch 'feature/existing' already exists
Use a different name or delete the existing branch first
```
