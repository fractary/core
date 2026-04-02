# Issue Refinement Flow

## Step 1: Fetch Issue Data
```bash
gh issue view <number> --json number,title,body,labels,state,comments
```
Validate: issue exists, is accessible. Warn if closed but allow refinement.

## Step 2: Analyze for Clarity Gaps

Review across five focus areas:

### 1. Goals & Context (WHY)
- What problem are we solving? Who's the target user? What's driving this?

### 2. Scope Boundaries (WHAT'S IN/OUT)
- What's included? What's explicitly out of scope? Constraints or dependencies?

### 3. Acceptance Criteria (DONE = ?)
- How do we verify completion? Specific behaviors? Edge cases? Success metrics?

### 4. Requirements Clarity (SPECIFICS)
- Vague terms needing definition? Unquantified metrics? Ambiguities?

### 5. User Experience (USER PERSPECTIVE)
- Expected user workflows? Feedback/errors users should see?

### AVOID (defer to architect phase):
- Technology/library choices
- Implementation approaches, code structure, architecture decisions
- Performance optimization strategies, testing frameworks

## Step 3: Generate 3-5 Questions

Each question must:
- Reference specific phrases or gaps in the issue
- Provide 2-4 possible answer options
- Explain WHY this question matters
- Be answerable with concrete, actionable information

Prioritize: highest-impact clarifications that unlock other decisions.

## Step 4: Post Questions to GitHub
```bash
gh issue comment <number> --body "<formatted questions>"
```
Format as structured markdown with numbered questions, options, and WHY explanations.

## Step 5: Present Questions to User (MANDATORY)

For each question, present to the user with:
- Clear question text with context
- Meaningful answer options
- "Skip this question" and "Custom answer" options

All answer patterns are acceptable (answer all, some, or none).

## Step 6: Collect Answers

Record which questions were answered, validate answers are actionable, prepare improvements.

## Step 7: Update Issue

Preserve existing content, enhance with clarifications. Add/improve:
- Goal section (clear problem statement)
- Requirements (in scope / out of scope)
- Acceptance criteria (specific, measurable checkboxes)
- User workflow description

```bash
gh issue edit <number> --body "<improved body>"
```

## Step 8: Post Completion Summary
Add "requirements-refined" label:
```bash
gh issue edit <number> --add-label "requirements-refined"
```
Post summary comment with what was clarified and next steps.
