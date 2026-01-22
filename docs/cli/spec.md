# Spec Toolset - CLI Reference

Command-line reference for the Spec toolset. Technical specification management.

## Command Structure

```bash
fractary-core spec <action> [options]
```

## Specification Commands

### spec create

Create a new specification.

```bash
fractary-core spec create [options]
```

**Options:**
- `--title <text>` - Specification title (required)
- `--type <type>` - Work type: `feature`, `bug`, `infrastructure`, `api`
- `--template <template>` - Template: `basic`, `feature`, `bug`, `infrastructure`, `api`
- `--work-id <id>` - Associated work item ID

**Examples:**
```bash
# Create feature spec
fractary-core spec create \
  --title "User Authentication" \
  --type feature \
  --template feature

# Create API spec with work item link
fractary-core spec create \
  --title "REST API Design" \
  --template api \
  --work-id 123
```

### spec get

Get a specification by ID.

```bash
fractary-core spec get <spec-id> [options]
```

**Arguments:**
- `spec-id` - Specification ID (e.g., SPEC-20240101)

**Options:**
- `--format <type>` - Output format: `json`, `markdown`, `text`

**Example:**
```bash
fractary-core spec get SPEC-20240101 --format markdown
```

### spec update

Update a specification.

```bash
fractary-core spec update <spec-id> [options]
```

**Arguments:**
- `spec-id` - Specification ID

**Options:**
- `--title <text>` - New title
- `--content <file>` - New content from file
- `--status <status>` - Status: `draft`, `review`, `approved`, `archived`

**Example:**
```bash
fractary-core spec update SPEC-20240101 --status review
```

### spec delete

Delete a specification.

```bash
fractary-core spec delete <spec-id> [options]
```

**Options:**
- `--force` - Skip confirmation

### spec list

List specifications.

```bash
fractary-core spec list [options]
```

**Options:**
- `--type <type>` - Filter by work type
- `--status <status>` - Filter by validation status
- `--format <type>` - Output format

**Examples:**
```bash
# List all specs
fractary-core spec list

# List feature specs
fractary-core spec list --type feature

# Output as JSON
fractary-core spec list --format json
```

## Validation Commands

### spec validate

Validate a specification.

```bash
fractary-core spec validate <spec-id> [options]
```

**Arguments:**
- `spec-id` - Specification ID

**Options:**
- `--format <type>` - Output format
- `--strict` - Fail on warnings

**Example:**
```bash
fractary-core spec validate SPEC-20240101
```

**Output:**
```
Validation Results for SPEC-20240101
====================================

Status: PARTIAL (75%)

Checks:
  ✓ Has title
  ✓ Has problem statement
  ✓ Has proposed solution
  ✗ Missing acceptance criteria
  ✓ Has technical approach

Suggestions:
  - Add specific acceptance criteria with measurable outcomes
  - Consider adding rollout plan section
```

### spec validate-all

Validate all specifications.

```bash
fractary-core spec validate-all [options]
```

**Options:**
- `--type <type>` - Filter by work type
- `--fail-fast` - Stop on first failure

## Refinement Commands

### spec refine

Get refinement questions for a specification.

```bash
fractary-core spec refine <spec-id> [options]
```

**Arguments:**
- `spec-id` - Specification ID

**Options:**
- `--interactive` - Interactive refinement mode

**Example:**
```bash
fractary-core spec refine SPEC-20240101
```

**Output:**
```
Refinement Questions for SPEC-20240101
======================================

HIGH PRIORITY:
  1. What are the specific acceptance criteria?
     Context: The spec describes the feature but lacks measurable outcomes.

  2. What error handling is required?
     Context: The API design doesn't specify error response formats.

MEDIUM PRIORITY:
  3. Are there performance requirements?
     Context: No latency or throughput targets specified.
```

## Archive Commands

### spec archive

Archive a completed specification.

```bash
fractary-core spec archive <spec-id> [options]
```

**Arguments:**
- `spec-id` - Specification ID

**Options:**
- `--reason <text>` - Archive reason
- `--destination <path>` - Custom archive location

**Example:**
```bash
fractary-core spec archive SPEC-20240101 --reason "Feature completed"
```

## Template Commands

### spec template list

List available templates.

```bash
fractary-core spec template list
```

**Output:**
```
Available Templates:
  basic          - Simple specification template
  feature        - Feature request with phases
  bug            - Bug fix specification
  infrastructure - Infrastructure changes
  api            - API design specification
```

### spec template show

Show template content.

```bash
fractary-core spec template show <template-name>
```

## Output Examples

### JSON Output

```bash
fractary-core spec get SPEC-20240101 --format json
```

```json
{
  "id": "SPEC-20240101",
  "title": "User Authentication",
  "workType": "feature",
  "template": "feature",
  "status": "draft",
  "metadata": {
    "author": "developer1",
    "version": "1.0",
    "createdAt": "2024-01-01T10:00:00Z"
  },
  "validation": {
    "status": "partial",
    "score": 75
  }
}
```

### Validation JSON

```bash
fractary-core spec validate SPEC-20240101 --format json
```

```json
{
  "specId": "SPEC-20240101",
  "status": "partial",
  "score": 75,
  "checks": [
    { "name": "has_title", "passed": true },
    { "name": "has_acceptance_criteria", "passed": false, "message": "Missing acceptance criteria" }
  ],
  "suggestions": [
    "Add specific acceptance criteria with measurable outcomes"
  ]
}
```

## Environment Variables

```bash
# Spec directory
export FRACTARY_SPEC_DIRECTORY=./specs

# Default template
export FRACTARY_SPEC_TEMPLATE=feature

# Auto-validation
export FRACTARY_SPEC_AUTO_VALIDATE=true
```

## Other Interfaces

- **SDK:** [Spec API](/docs/sdk/spec.md)
- **MCP:** [Spec Tools](/docs/mcp/spec.md)
- **Plugin:** [Spec Plugin](/docs/plugins/spec.md)
- **Configuration:** [Spec Config](/docs/configuration/README.md#spec)
