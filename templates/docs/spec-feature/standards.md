# Feature Specification Standards

## Required Conventions

### 1. Overview
- ALWAYS provide a clear, concise summary of the feature and its value
- ALWAYS explain why this feature is needed (business context)
- NEVER leave the overview as a placeholder

### 2. User Stories
- ALWAYS write user stories in "As a [role], I want [goal] so that [benefit]" format
- ALWAYS include at least one user story
- Each story should represent a distinct use case

### 3. Requirements
- ALWAYS separate functional and non-functional requirements
- ALWAYS write requirements as checkable items (- [ ] format)
- Requirements should be specific, measurable, and testable
- NEVER use vague language ("should be fast", "must be good")

### 4. Acceptance Criteria
- ALWAYS write acceptance criteria as verifiable checkboxes
- Each criterion should be independently testable
- Include both happy path and error scenarios
- NEVER duplicate requirements as acceptance criteria verbatim

### 5. Testing Strategy
- ALWAYS specify test types (unit, integration, e2e)
- ALWAYS include specific test scenarios, not just categories
- Testing should cover all acceptance criteria

## Optional Section Guidelines

### Technical Design
- Include when the implementation approach is non-obvious
- Document key architectural decisions and trade-offs
- Reference existing patterns in the codebase

### API Changes
- Document all new or modified endpoints
- Include request/response schemas
- Document error codes and edge cases

### Rollout Plan
- Include for features requiring phased deployment
- Document feature flags, migration steps, or rollback procedures

## Best Practices

- Keep specs focused on WHAT and WHY, not HOW (implementation details belong in code)
- Link related specs via the `related` frontmatter field
- Update the spec as understanding evolves (use the refinement changelog)
- Mark acceptance criteria as complete during implementation
