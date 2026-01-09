# Bulk Issue Creation Test Plan

## Overview

This test plan verifies the `fractary-work:issue-create-bulk` command and `issue-bulk-creator` agent implementation according to the specification in `SPEC-20260108-bulk-issue-creation.md`.

## Test Environment Setup

### Prerequisites

1. **GitHub CLI authenticated**:
   ```bash
   gh auth status
   ```

2. **GitHub repository access**:
   ```bash
   gh repo view
   ```

3. **Test repository** (recommended):
   - Use a test repository to avoid cluttering production
   - Or use a dedicated "test-issues" label to identify test issues

4. **Clean state**:
   - Record existing issue count before testing
   - Plan to clean up test issues after verification

### Setup Test Data

Create test project structures for different scenarios:

```bash
# Test structure 1: Datasets
mkdir -p test-project/datasets/ipeds
touch test-project/datasets/ipeds/{hd,ic,enrollment,completions}.csv

# Test structure 2: API endpoints
mkdir -p test-project/src/api/v1
touch test-project/src/api/v1/{users,posts,comments}.ts

# Test structure 3: Templates
mkdir -p test-project/templates
touch test-project/templates/{blog-post,landing-page,documentation}.hbs

# Test template
mkdir -p test-project/.github/ISSUE_TEMPLATE
cat > test-project/.github/ISSUE_TEMPLATE/test.md << 'EOF'
---
name: Test Template
labels: test
---

# Test Issue

## Requirements
- [ ] Implement feature

## Acceptance Criteria
- [ ] Feature works as expected

## Notes
{notes}
EOF
```

## Test Scenarios

### Test 1: Explicit Prompt

**Objective**: Verify agent creates issues from explicit list

**Command**:
```bash
/fractary-work:issue-create-bulk \
  --prompt "Create test issues for: test1, test2, test3" \
  --type feature \
  --label test
```

**Expected Behavior**:
1. ✅ Agent parses prompt and extracts 3 items
2. ✅ Agent presents plan with 3 issues:
   - Clear titles (e.g., "Implement test1", "Implement test2", "Implement test3")
   - Type: feature
   - Labels: test
3. ✅ Agent uses AskUserQuestion for confirmation
4. ✅ After approval, agent creates 3 issues
5. ✅ Agent returns summary with issue numbers and URLs
6. ✅ All issues are labeled with "test"
7. ✅ All issues have type "feature"

**Verification**:
```bash
# Check issues were created
gh issue list --label test --limit 10

# Verify issue details
gh issue view <number> --json title,labels,body
```

**Success Criteria**:
- [ ] 3 issues created successfully
- [ ] All issues have "test" label
- [ ] All issues are type "feature"
- [ ] Issue titles match expected format
- [ ] Summary includes issue URLs

---

### Test 2: Conversation Context

**Objective**: Verify agent uses conversation context when no prompt provided

**Setup**:
In conversation, discuss:
```
"We need to implement three features: authentication, authorization, and logging"
```

**Command**:
```bash
/fractary-work:issue-create-bulk
```

**Expected Behavior**:
1. ✅ Agent reviews conversation context
2. ✅ Agent extracts 3 features mentioned
3. ✅ Agent presents plan with 3 issues:
   - "Implement authentication" (or similar)
   - "Implement authorization" (or similar)
   - "Add logging" (or similar)
4. ✅ Agent requests confirmation
5. ✅ After approval, agent creates issues
6. ✅ Agent returns summary

**Verification**:
```bash
gh issue list --limit 10
```

**Success Criteria**:
- [ ] 3 issues created based on conversation
- [ ] Issue titles reflect discussed features
- [ ] Issues have appropriate labels (agent-determined)
- [ ] Issues have meaningful descriptions

---

### Test 3: Template Usage

**Objective**: Verify agent uses GitHub issue template correctly

**Command**:
```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for: feature1, feature2" \
  --template test.md \
  --label test
```

**Expected Behavior**:
1. ✅ Agent loads template from `.github/ISSUE_TEMPLATE/test.md`
2. ✅ Agent presents plan showing template will be used
3. ✅ Agent presents plan with 2 issues
4. ✅ After approval, agent creates issues using template structure
5. ✅ Template placeholders filled: `{notes}` → relevant content
6. ✅ Template labels applied (test)
7. ✅ Agent returns summary

**Verification**:
```bash
# Check issue structure matches template
gh issue view <number> --json body

# Verify template labels applied
gh issue view <number> --json labels
```

**Success Criteria**:
- [ ] 2 issues created with template structure
- [ ] Issues contain template sections (Requirements, Acceptance Criteria)
- [ ] Template labels ("test") applied
- [ ] Placeholders filled appropriately
- [ ] Issues have checkboxes from template

---

### Test 4: Project Intelligence - Datasets

**Objective**: Verify agent discovers datasets in project structure

**Setup**:
```bash
cd test-project  # Contains datasets/ipeds/*.csv
```

**Command**:
```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for all datasets in the ipeds folder" \
  --label dataset --label test
```

**Expected Behavior**:
1. ✅ Agent searches filesystem for datasets
2. ✅ Agent finds: hd.csv, ic.csv, enrollment.csv, completions.csv
3. ✅ Agent presents plan with 4 issues:
   - "Load IPEDS hd dataset"
   - "Load IPEDS ic dataset"
   - "Load IPEDS enrollment dataset"
   - "Load IPEDS completions dataset"
4. ✅ All issues have labels: dataset, test
5. ✅ After approval, agent creates 4 issues
6. ✅ Agent returns summary with URLs

**Verification**:
```bash
gh issue list --label dataset,test
```

**Success Criteria**:
- [ ] 4 issues created (one per dataset file)
- [ ] Issue titles reference correct dataset names
- [ ] All issues labeled with "dataset" and "test"
- [ ] Issues have appropriate descriptions

---

### Test 5: Project Intelligence - API Endpoints

**Objective**: Verify agent discovers API endpoints in codebase

**Setup**:
```bash
cd test-project  # Contains src/api/v1/*.ts
```

**Command**:
```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for all v1 API endpoints" \
  --label api --label test
```

**Expected Behavior**:
1. ✅ Agent searches codebase for API endpoints
2. ✅ Agent finds: users.ts, posts.ts, comments.ts
3. ✅ Agent presents plan with 3 issues for endpoints
4. ✅ All issues have labels: api, test
5. ✅ After approval, agent creates issues
6. ✅ Agent returns summary

**Verification**:
```bash
gh issue list --label api,test
```

**Success Criteria**:
- [ ] 3 issues created (one per endpoint)
- [ ] Issue titles reference correct endpoint names
- [ ] All issues labeled with "api" and "test"

---

### Test 6: Error Handling - No Items Found

**Objective**: Verify agent handles case when discovery finds nothing

**Command**:
```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for nonexistent datasets in missing-folder/"
```

**Expected Behavior**:
1. ✅ Agent searches for datasets
2. ✅ Agent finds nothing
3. ✅ Agent responds with clear error message:
   - "I couldn't find any datasets in missing-folder/"
   - Lists what was searched
   - Suggests alternatives (explicit list, different directory)
4. ✅ Agent does NOT create any issues
5. ✅ Agent waits for clarification

**Verification**:
```bash
# Verify no issues were created
gh issue list --limit 5
```

**Success Criteria**:
- [ ] No issues created
- [ ] Clear error message provided
- [ ] Agent suggests alternatives
- [ ] Agent exits gracefully

---

### Test 7: Workflow Label

**Objective**: Verify agent handles workflow labels correctly

**Command**:
```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for: test1, test2" \
  --label "workflow:etl" \
  --label test
```

**Expected Behavior**:
1. ✅ Agent presents plan showing workflow label
2. ✅ Plan displays: "Workflow: etl" (detected from label)
3. ✅ After approval, issues created with workflow label
4. ✅ Agent returns summary mentioning workflow

**Verification**:
```bash
# Check workflow label applied
gh issue view <number> --json labels | grep workflow:etl
```

**Success Criteria**:
- [ ] Issues created with "workflow:etl" label
- [ ] Plan showed workflow detection
- [ ] Summary mentioned workflow

---

### Test 8: Multiple Labels

**Objective**: Verify agent handles multiple labels correctly

**Command**:
```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for: test1, test2" \
  --label dataset \
  --label etl \
  --label ipeds \
  --label test
```

**Expected Behavior**:
1. ✅ Agent presents plan with all labels listed
2. ✅ After approval, issues created with all labels
3. ✅ Agent returns summary listing all labels

**Verification**:
```bash
gh issue view <number> --json labels
```

**Success Criteria**:
- [ ] Issues have all 4 labels: dataset, etl, ipeds, test
- [ ] Plan showed all labels
- [ ] Summary listed all labels

---

### Test 9: Duplicate Detection

**Objective**: Verify agent checks for existing issues

**Setup**:
```bash
# Create an existing issue
gh issue create --title "Load IPEDS hd dataset" --body "Test" --label test
```

**Command**:
```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for IPEDS datasets: hd, ic, enrollment" \
  --label test
```

**Expected Behavior**:
1. ✅ Agent checks existing issues
2. ✅ Agent detects "Load IPEDS hd dataset" already exists
3. ✅ Agent presents plan with warning about duplicate
4. ✅ Agent offers options:
   - Create only new issues (ic, enrollment)
   - Create all issues anyway
   - Cancel
5. ✅ User can choose strategy

**Verification**:
Based on user choice, verify appropriate issues created.

**Success Criteria**:
- [ ] Agent detects existing issue
- [ ] Agent warns about duplicate
- [ ] Agent offers resolution options
- [ ] Agent follows user's choice

---

### Test 10: Assignee

**Objective**: Verify agent assigns issues correctly

**Command**:
```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for: test1, test2" \
  --assignee @me \
  --label test
```

**Expected Behavior**:
1. ✅ Agent presents plan showing assignee
2. ✅ After approval, issues created with assignee
3. ✅ Agent returns summary mentioning assignee

**Verification**:
```bash
gh issue view <number> --json assignees
```

**Success Criteria**:
- [ ] Issues assigned to specified user
- [ ] Plan showed assignee
- [ ] Summary mentioned assignee

---

### Test 11: Issue Type

**Objective**: Verify agent respects --type argument

**Command**:
```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for: bug1, bug2" \
  --type bug \
  --label test
```

**Expected Behavior**:
1. ✅ Agent presents plan with type: bug
2. ✅ After approval, issues created as type bug
3. ✅ Issues have appropriate bug-related labels/properties

**Verification**:
```bash
gh issue view <number> --json labels,body
```

**Success Criteria**:
- [ ] Issues created with type "bug"
- [ ] Plan showed type: bug

---

### Test 12: Partial Creation Failure

**Objective**: Verify agent handles partial failures gracefully

**Setup**:
This test may require simulating failures (rate limits, invalid labels, etc.)

**Expected Behavior**:
1. ✅ Some issues create successfully
2. ✅ Some issues fail with errors
3. ✅ Agent continues despite failures
4. ✅ Agent returns summary showing:
   - Successfully created issues with URLs
   - Failed issues with error messages
5. ✅ Agent provides guidance on next steps

**Success Criteria**:
- [ ] Successful issues created
- [ ] Failed issues reported with errors
- [ ] Agent doesn't stop on first failure
- [ ] Clear summary of successes and failures

---

### Test 13: Cancellation

**Objective**: Verify user can cancel before creation

**Command**:
```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for: test1, test2, test3" \
  --label test
```

**Expected Behavior**:
1. ✅ Agent presents plan
2. ✅ Agent requests confirmation via AskUserQuestion
3. ✅ User selects "No, cancel"
4. ✅ Agent exits with message: "Issue creation cancelled by user"
5. ✅ No issues created

**Verification**:
```bash
# Verify no new issues
gh issue list --label test
```

**Success Criteria**:
- [ ] No issues created
- [ ] Agent respects cancellation
- [ ] Clear cancellation message

---

### Test 14: Context Flag

**Objective**: Verify --context flag adds instructions

**Command**:
```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for: test1, test2" \
  --context "Make these issues high priority with detailed acceptance criteria" \
  --label test
```

**Expected Behavior**:
1. ✅ Agent uses context as additional instructions
2. ✅ Issues created reflect context (detailed descriptions)
3. ✅ Agent returns summary

**Success Criteria**:
- [ ] Issues have more detailed content than without context
- [ ] Context instructions followed

---

## Test Execution Checklist

### Pre-Testing

- [ ] GitHub CLI authenticated
- [ ] Test repository accessible
- [ ] Test project structures created
- [ ] Existing issue count recorded

### Core Functionality Tests

- [ ] Test 1: Explicit Prompt
- [ ] Test 2: Conversation Context
- [ ] Test 3: Template Usage
- [ ] Test 4: Project Intelligence - Datasets
- [ ] Test 5: Project Intelligence - API Endpoints

### Feature Tests

- [ ] Test 6: Error Handling - No Items Found
- [ ] Test 7: Workflow Label
- [ ] Test 8: Multiple Labels
- [ ] Test 9: Duplicate Detection
- [ ] Test 10: Assignee
- [ ] Test 11: Issue Type

### Edge Cases

- [ ] Test 12: Partial Creation Failure
- [ ] Test 13: Cancellation
- [ ] Test 14: Context Flag

### Post-Testing

- [ ] Clean up test issues
- [ ] Document any bugs found
- [ ] Verify all success criteria met

## Bug Reporting Template

If issues are found during testing:

```markdown
## Bug: [Brief Description]

**Test**: Test N - [Test Name]

**Command**:
```bash
[Command that triggered bug]
```

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. ...

**Environment**:
- OS: [OS version]
- GitHub CLI: [gh version]
- Repository: [test repo]

**Severity**: [Critical | High | Medium | Low]

**Logs/Screenshots**:
[Attach any relevant logs or screenshots]
```

## Success Criteria Summary

All tests must pass with:
- ✅ Command delegates to agent correctly
- ✅ Agent analyzes project structure and context
- ✅ Agent presents clear confirmation before creating
- ✅ Agent creates issues with appropriate details
- ✅ Agent returns summary with URLs
- ✅ Works without configuration (context-based)
- ✅ Supports GitHub issue templates
- ✅ Error handling for edge cases
- ✅ User documentation available
- ✅ All test scenarios pass

## Test Results

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Explicit Prompt | ⬜ Pending | |
| 2 | Conversation Context | ⬜ Pending | |
| 3 | Template Usage | ⬜ Pending | |
| 4 | Project Intelligence - Datasets | ⬜ Pending | |
| 5 | Project Intelligence - API Endpoints | ⬜ Pending | |
| 6 | Error Handling | ⬜ Pending | |
| 7 | Workflow Label | ⬜ Pending | |
| 8 | Multiple Labels | ⬜ Pending | |
| 9 | Duplicate Detection | ⬜ Pending | |
| 10 | Assignee | ⬜ Pending | |
| 11 | Issue Type | ⬜ Pending | |
| 12 | Partial Failure | ⬜ Pending | |
| 13 | Cancellation | ⬜ Pending | |
| 14 | Context Flag | ⬜ Pending | |

**Legend**:
- ⬜ Pending
- ✅ Passed
- ❌ Failed
- ⚠️ Passed with issues

## Cleanup Script

After testing, clean up test issues:

```bash
# List all test issues
gh issue list --label test --json number --jq '.[].number'

# Close all test issues (careful!)
gh issue list --label test --json number --jq '.[].number' | \
  xargs -I {} gh issue close {}

# Or delete test issues if you have permissions
# (Note: This requires additional GitHub permissions)
```

## Notes

- Use a dedicated test repository to avoid polluting production
- Add a "test" label to all test issues for easy cleanup
- Document any unexpected behaviors
- Report bugs found during testing
- Update test plan if new scenarios are discovered
