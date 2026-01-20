# Changelog Log Standards

## Required Conventions

### 1. Versioning
- ALWAYS use semantic versioning (MAJOR.MINOR.PATCH)
- ALWAYS specify the version affected by the change
- ALWAYS increment version appropriately for change type

### 2. Change Types (Keep a Changelog format)
- **added**: New features
- **changed**: Changes in existing functionality
- **fixed**: Bug fixes
- **removed**: Removed features
- **deprecated**: Soon-to-be removed features
- **security**: Security vulnerability fixes

### 3. Breaking Changes
- ALWAYS mark breaking changes explicitly
- ALWAYS provide migration instructions for breaking changes
- ALWAYS include before/after examples for API changes

### 4. Linking
- ALWAYS reference related issues and PRs
- ALWAYS link to superseded changes if applicable

## Best Practices

- Use unique change_id format: `CHANGE-{timestamp}-{random}`
- Write changes from user perspective, not developer perspective
- Group related changes into single changelog entries
- Keep changelog entries permanent (historical record)
- Use conventional commit format for consistency
- Include deprecation timeline for deprecated features
