# Refinement Flow

## Critical Rules
1. ALWAYS run structural gap scan first
2. ALWAYS load type standards for context
3. ALWAYS read the full document before generating AI-level questions
4. NEVER apply changes without user confirmation
5. ALWAYS present questions organized by priority (high, medium, low)

## Step 1: Structural gap scan
```bash
fractary-core docs doc-refine-scan <id> --json
```
Collect: missing sections, vague content, empty sections, placeholder markers.

## Step 2: Load document and type context
```bash
fractary-core docs doc-get <id> --json
fractary-core docs type-info <docType> --json
```

## Step 3: AI-powered gap analysis
Read document thoroughly and identify:
- Vague or under-specified sections
- Missing edge cases or error scenarios
- Incomplete definitions
- Contradictions between sections
- Requirements that aren't testable
- Missing dependencies or prerequisites
- Gaps between standards and content

## Step 4: Generate prioritized questions
Combine structural scan + AI analysis. Organize by priority:
- **High**: Missing required sections, critical gaps
- **Medium**: Vague content, missing edge cases
- **Low**: Style improvements, optional sections

## Step 5: Post questions to work item (conditional)
If type has `refinement.post_questions_to_work_item` AND doc has work_id:
```bash
gh issue comment <work_id> --body "<formatted questions>"
```

## Step 6: Interactive Q&A
Present questions to user one category at a time. Apply improvements for each answer.

## Step 7: Apply improvements
Update document via CLI:
```bash
fractary-core docs doc-update <id> --content "<improved_content>" --json
```
If type has `refinement.maintain_changelog`: add changelog entry.

## Step 8: Post completion summary (if work-linked)
```bash
gh issue comment <work_id> --body "Refinement complete: <N> questions addressed, <M> sections updated."
```
