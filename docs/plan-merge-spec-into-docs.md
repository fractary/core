# Implementation Plan: Merge Spec Plugin into Docs Plugin

## Overview

Absorb spec types as doc types within the docs plugin. Add refinement, archival (via file plugin sources), work-linking, and fulfillment validation as opt-in capabilities available to any doc type. Leave the spec plugin in place for reference; it will be removed in a separate future issue.

**Prerequisite reading**: `docs/analysis-spec-vs-docs-plugin.md`

---

## Phase 1: Extend DocType Interface & SDK Types

**Goal**: Extend the docs type system to support the 4 new opt-in capabilities (archive, work-linking, refinement, fulfillment validation) so that any doc type can configure them.

### 1.1 Extend `DocType` interface

**File**: `sdk/js/src/docs/types.ts`

Add 4 new optional config blocks to the `DocType` interface:

```typescript
// Add to DocType interface (after indexConfig)

/**
 * Archive configuration (opt-in per type)
 * Delegates file operations to the file plugin's named sources
 */
archive?: {
  /** Enable archival for this doc type */
  enabled: boolean;
  /** Named file source from .fractary/config.yaml (e.g., 'archive') */
  source: string;
  /** What triggers archival */
  trigger: 'manual' | 'on_status_change' | 'on_work_complete';
  /** Status value(s) that trigger archival when trigger is on_status_change */
  triggerStatuses?: string[];
  /** Verify checksum after archive copy */
  verifyChecksum?: boolean;
  /** Delete original after successful archive */
  deleteOriginal?: boolean;
  /** Retention policy */
  retentionDays?: number | 'forever';
};

/**
 * Work-linking configuration (opt-in per type)
 * Links documents to external work items (GitHub issues, etc.)
 */
workLinking?: {
  /** Enable work-linking for this doc type */
  enabled: boolean;
  /** Comment on work item when document is created */
  commentOnCreate?: boolean;
  /** Comment on work item when document is archived */
  commentOnArchive?: boolean;
  /** Require work item to be closed before archiving */
  requireClosedForArchive?: boolean;
};

/**
 * Refinement configuration (opt-in per type)
 * Enables gap scanning, question generation, and iterative improvement
 */
refinement?: {
  /** Enable refinement for this doc type */
  enabled: boolean;
  /** Post refinement questions to linked work item */
  postQuestionsToWorkItem?: boolean;
  /** Maintain a changelog of refinements in the document */
  maintainChangelog?: boolean;
};

/**
 * Fulfillment validation configuration (opt-in per type)
 * Validates whether external implementation matches the document's requirements
 */
fulfillment?: {
  /** Enable fulfillment validation for this doc type */
  enabled: boolean;
  /** Check acceptance criteria checkboxes */
  checkAcceptanceCriteria?: boolean;
  /** Check whether expected files were modified */
  checkFilesModified?: boolean;
  /** Check whether tests were added */
  checkTestsAdded?: boolean;
  /** Check whether docs were updated */
  checkDocsUpdated?: boolean;
};
```

### 1.2 Add archive/refine/work-linking result types

**File**: `sdk/js/src/docs/types.ts`

Add result types for the new operations:

```typescript
/** Result of a document archive operation */
export interface DocArchiveResult {
  success: boolean;
  sourcePath: string;
  archivePath: string;
  checksum?: string;
  originalDeleted: boolean;
}

/** Result of a document refinement scan */
export interface DocRefineResult {
  questionsGenerated: number;
  categories: string[];
  questions: DocRefinementQuestion[];
}

/** A refinement question for a document */
export interface DocRefinementQuestion {
  id: string;
  question: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  section?: string;
}

/** Result of fulfillment validation */
export interface DocFulfillmentResult {
  status: 'pass' | 'partial' | 'fail';
  score: number;
  checks: Record<string, {
    status: 'pass' | 'warn' | 'fail';
    detail: string;
  }>;
  suggestions?: string[];
}
```

### 1.3 Update DocTypeRegistry to parse new config blocks

**File**: `sdk/js/src/docs/type-registry.ts`

Update the YAML parsing in `loadDocTypeFromDirectory()` and related methods to parse `archive`, `workLinking`, `refinement`, and `fulfillment` blocks from `type.yaml` files into the `DocType` interface. These fields are optional, so types that don't define them just get `undefined`.

---

## Phase 2: Create Spec Doc Types

**Goal**: Create 5 spec doc types in the templates system, porting the hardcoded spec templates from `sdk/js/src/spec/templates.ts` into the docs data-driven format.

### 2.1 Add spec types to manifest

**File**: `templates/docs/manifest.yaml`

Add 5 new entries:

```yaml
  - id: spec-basic
    display_name: Basic Specification
    description: Minimal specification for simple changes
    path: ./spec-basic
    url: ${base_url}/spec-basic/type.yaml

  - id: spec-feature
    display_name: Feature Specification
    description: Comprehensive specification for new feature implementation
    path: ./spec-feature
    url: ${base_url}/spec-feature/type.yaml

  - id: spec-bug
    display_name: Bug Fix Specification
    description: Specification for bug investigation and fix
    path: ./spec-bug
    url: ${base_url}/spec-bug/type.yaml

  - id: spec-api
    display_name: API Specification
    description: Specification for API design and implementation
    path: ./spec-api
    url: ${base_url}/spec-api/type.yaml

  - id: spec-infrastructure
    display_name: Infrastructure Specification
    description: Specification for infrastructure and DevOps changes
    path: ./spec-infrastructure
    url: ${base_url}/spec-infrastructure/type.yaml
```

### 2.2 Create type directories

For each of the 5 spec types, create 3 files. Below is the **spec-feature** example in detail; the others follow the same pattern with type-specific sections.

**Sources to port from**:
- Sections & structure: `sdk/js/src/spec/templates.ts` (the `featureTemplate`, `basicTemplate`, `bugTemplate`, `apiTemplate`, `infrastructureTemplate` objects)
- Schema & validation: `plugins/docs/schemas/spec.schema.json` (already exists — a head start)
- Frontmatter fields: `sdk/js/src/spec/types.ts` (`SpecFrontmatter` interface)

#### `templates/docs/spec-feature/type.yaml`

```yaml
id: spec-feature
display_name: Feature Specification
description: Comprehensive specification for new feature implementation

output_path: specs

file_naming:
  pattern: "WORK-{work_id}-{slug}.md"
  auto_number: false
  slug_source: title
  slug_max_length: 50

frontmatter:
  required_fields:
    - title
    - fractary_doc_type
    - status
    - date
  optional_fields:
    - work_id
    - work_type
    - source
    - validation_status
    - template
    - tags
    - author
    - related
    - changelog
  defaults:
    fractary_doc_type: spec-feature
    status: draft
    source: conversation
    validation_status: not_validated
    template: feature

structure:
  required_sections:
    - Overview
    - Requirements
    - Acceptance Criteria
    - Technical Approach
    - Files to Modify
    - Testing Strategy
    - Success Criteria
  optional_sections:
    - Background
    - Non-Goals
    - Dependencies
    - Migration Plan
    - Security Considerations
    - Performance Considerations
    - Rollback Plan
    - Alternatives Considered
    - Open Questions
    - References
  section_order:
    - Overview
    - Background
    - Requirements
    - Acceptance Criteria
    - Non-Goals
    - Technical Approach
    - Files to Modify
    - Dependencies
    - Migration Plan
    - Testing Strategy
    - Security Considerations
    - Performance Considerations
    - Rollback Plan
    - Success Criteria
    - Alternatives Considered
    - Open Questions
    - References

status:
  allowed_values:
    - draft
    - review
    - approved
    - in-progress
    - completed
    - archived
  default: draft

# Archive configuration - delegates to file plugin sources
archive:
  enabled: true
  source: archive
  trigger: on_status_change
  trigger_statuses: [archived]
  verify_checksum: true
  delete_original: true

# Work-linking - links spec to GitHub issues
work_linking:
  enabled: true
  comment_on_create: true
  comment_on_archive: true
  require_closed_for_archive: true

# Refinement - gap scanning and Q&A
refinement:
  enabled: true
  post_questions_to_work_item: true
  maintain_changelog: true

# Fulfillment validation - check implementation matches spec
fulfillment:
  enabled: true
  check_acceptance_criteria: true
  check_files_modified: true
  check_tests_added: true
  check_docs_updated: true

index_config:
  index_file: specs/README.md
  sort_by: date
  sort_order: desc
  entry_template: "- [**{{work_id}}**: {{title}}]({{relative_path}}) — {{status}}"
```

#### `templates/docs/spec-feature/template.md`

Port from `featureTemplate` in `sdk/js/src/spec/templates.ts`, converting the TypeScript `TemplateSection[]` into Mustache format:

```markdown
---
title: "{{title}}"
fractary_doc_type: spec-feature
status: {{status}}
date: {{date}}
{{#work_id}}
work_id: "{{work_id}}"
{{/work_id}}
work_type: {{work_type}}
source: {{source}}
validation_status: not_validated
tags: []
---

# {{title}}

## Overview

{{overview}}

{{#background}}
## Background

{{background}}
{{/background}}

## Requirements

{{#requirements}}
- [ ] {{.}}
{{/requirements}}

## Acceptance Criteria

{{#acceptance_criteria}}
- [ ] {{.}}
{{/acceptance_criteria}}

{{#non_goals}}
## Non-Goals

{{#non_goals}}
- {{.}}
{{/non_goals}}
{{/non_goals}}

## Technical Approach

{{technical_approach}}

## Files to Modify

{{#files_to_modify}}
- `{{.}}`
{{/files_to_modify}}

{{#dependencies}}
## Dependencies

{{#dependencies}}
- {{.}}
{{/dependencies}}
{{/dependencies}}

{{#migration_plan}}
## Migration Plan

{{migration_plan}}
{{/migration_plan}}

## Testing Strategy

{{testing_strategy}}

{{#security_considerations}}
## Security Considerations

{{security_considerations}}
{{/security_considerations}}

{{#performance_considerations}}
## Performance Considerations

{{performance_considerations}}
{{/performance_considerations}}

{{#rollback_plan}}
## Rollback Plan

{{rollback_plan}}
{{/rollback_plan}}

## Success Criteria

{{#success_criteria}}
- [ ] {{.}}
{{/success_criteria}}

{{#alternatives_considered}}
## Alternatives Considered

{{alternatives_considered}}
{{/alternatives_considered}}

{{#open_questions}}
## Open Questions

{{#open_questions}}
- [ ] {{.}}
{{/open_questions}}
{{/open_questions}}
```

#### `templates/docs/spec-feature/standards.md`

Write standards document covering:
- Spec-feature writing conventions (clarity, completeness, testability)
- Required level of detail for each section
- How to write good acceptance criteria (specific, measurable, testable)
- How to document technical approach (enough detail for implementation, not over-specified)
- Changelog conventions when refining

### 2.3 Create remaining 4 spec type directories

Repeat the pattern for:

| Type | Source Template | Key Differences |
|------|---------------|-----------------|
| `spec-basic` | `basicTemplate` | Fewer required sections (Overview, Requirements, Technical Approach, Testing). Minimal spec for simple changes. |
| `spec-bug` | `bugTemplate` | Has Bug Report, Root Cause Analysis, Fix Approach sections. Simpler than feature. |
| `spec-api` | `apiTemplate` | Has Endpoints, Request/Response Schema, Authentication, Rate Limiting, Error Codes sections. API-focused. |
| `spec-infrastructure` | `infrastructureTemplate` | Has Infrastructure Changes, Monitoring, Alerting, Capacity, Rollback sections. Ops-focused. |

Each gets `type.yaml`, `template.md`, `standards.md`. All 5 types share the same `archive`, `work_linking`, `refinement`, and `fulfillment` config blocks (since all specs need these), but with type-appropriate sections and structure.

### 2.4 Add JSON schemas for spec types

**File**: `plugins/docs/schemas/spec-feature.schema.json` (and similar for each type)

Update the existing `plugins/docs/schemas/spec.schema.json` and split into per-type schemas if needed, or keep a single generic spec schema that covers all 5 types with type-specific required sections. The existing `spec.schema.json` is a strong starting point — it already has `work_id`, status transitions, and validation rules.

---

## Phase 3: Add Docs Archive Capability

**Goal**: Add a `docs-archiver` agent and `archive` CLI command that archives documents using file plugin sources, configured per doc type.

### 3.1 Add `archive` CLI command

**File**: `cli/src/commands/docs/doc.ts`

Add `createDocArchiveCommand()`:

```
fractary-core docs doc-archive <id> [--source <name>] [--json]
```

Implementation:
1. Load doc by ID via `DocsManager.getDoc(id)`
2. Load doc type via `DocTypeRegistry.getType(docType)` to get archive config
3. If archive config not enabled, error with "This doc type does not support archival"
4. Get `FileManager` for the configured source via `getFileManagerForSource(archiveConfig.source)`
5. Read file content, compute SHA256 checksum
6. Write to archive source with path: `archive/{docType}/{year}/{filename}`
7. If `verifyChecksum`: re-read from archive, compare checksums
8. If `deleteOriginal`: delete local file via `DocsManager.deleteDoc(id)`
9. Return `DocArchiveResult`

The `--source` flag allows overriding the type's default archive source.

Port the checksum verification pattern from `cli/src/commands/spec/spec.ts` lines 305-368 (the defense-in-depth upload verification).

### 3.2 Add `archive` plugin command

**File**: `plugins/docs/commands/archive.md`

```markdown
---
name: archive
description: Archive a document using its type's configured archive source
usage: /fractary-docs:archive <id> [--source <name>]
delegates_to: docs-archiver agent
---
```

### 3.3 Create `docs-archiver` agent

**File**: `plugins/docs/agents/docs-archiver.md`

Model: `claude-haiku-4-5`

Workflow:
1. Identify document to archive (by ID or path)
2. Load doc and detect type
3. Load type's archive config
4. **If type has `work_linking.require_closed_for_archive`**: Check work item state via `gh issue view <work_id> --json state` — refuse if open
5. Execute archive via CLI: `fractary-core docs doc-archive <id> --json`
6. **If type has `work_linking.comment_on_archive`**: Comment on work item via `gh issue comment <work_id> --body "..."`
7. Report results

Note: Steps 4 and 6 are conditional on work-linking config — only spec types (and any other types that opt in) get GitHub integration.

### 3.4 Register new agent and command

**File**: `plugins/docs/.claude-plugin/plugin.json`

Add `docs-archiver.md` to the agents list and ensure `archive.md` is in the commands directory.

---

## Phase 4: Add Docs Refinement Capability

**Goal**: Add a `docs-refiner` agent and `refine` CLI command that scans documents for gaps, generates questions, and applies improvements.

### 4.1 Add `refine-scan` CLI command

**File**: `cli/src/commands/docs/doc.ts`

Add `createDocRefineScanCommand()`:

```
fractary-core docs doc-refine-scan <id> [--json]
```

Implementation:
1. Load doc by ID via `DocsManager.getDoc(id)`
2. Load doc type via `DocTypeRegistry.getType(docType)` to get structure + standards
3. Parse document sections
4. For each required section: check length, check for vague language markers ("TBD", "TODO", "as needed"), check for missing specificity
5. For each optional section that's absent: note as potential gap
6. Return `DocRefineResult` with categorized questions

This is the deterministic scan. The AI-powered gap analysis happens in the agent layer.

### 4.2 Add `refine` plugin command

**File**: `plugins/docs/commands/refine.md`

```markdown
---
name: refine
description: Refine a document through gap scanning and interactive Q&A
usage: /fractary-docs:refine <id>
delegates_to: docs-refiner agent
---
```

### 4.3 Create `docs-refiner` agent

**File**: `plugins/docs/agents/docs-refiner.md`

Model: `claude-opus-4-6` (needs strong reasoning for gap identification)

Port and generalize from `plugins/spec/agents/spec-refiner.md`:

Workflow:
1. Run structural gap scan: `fractary-core docs doc-refine-scan <id> --json`
2. Load doc type's standards (`type-info <type> --standards`)
3. **AI analysis**: Read the document, identify:
   - Vague or under-specified sections
   - Missing edge cases
   - Incomplete definitions
   - Contradictions between sections
4. Generate prioritized questions grouped by category
5. **If type has `refinement.post_questions_to_work_item`** and doc has `work_id`: Post questions to GitHub issue
6. Present questions to user for interactive Q&A
7. Apply improvements based on answers
8. **If type has `refinement.maintain_changelog`**: Add changelog entry to document
9. Update doc via `fractary-core docs doc-update <id> --content "..." --json`
10. Post completion summary if work-linked

Key generalization: The refiner loads required/optional sections and standards from the type definition at runtime, making it work for any doc type — not just specs.

### 4.4 Register new agent and command

**File**: `plugins/docs/.claude-plugin/plugin.json`

Add `docs-refiner.md` to agents list.

---

## Phase 5: Add Fulfillment Validation

**Goal**: Extend the docs-validator to support an optional fulfillment validation mode, configured per doc type.

### 5.1 Add `validate-fulfillment` CLI command

**File**: `cli/src/commands/docs/doc.ts`

Add `createDocValidateFulfillmentCommand()`:

```
fractary-core docs doc-validate-fulfillment <id> [--json]
```

Implementation:
1. Load doc by ID
2. Load type's fulfillment config — error if not enabled
3. Parse document for acceptance criteria (checkbox items `- [ ]` / `- [x]`)
4. Count completed vs total
5. Optionally check git diff for files mentioned in "Files to Modify" section
6. Return `DocFulfillmentResult`

### 5.2 Extend `docs-validator` agent

**File**: `plugins/docs/agents/docs-validator.md`

Add fulfillment validation as an additional step in the existing validator workflow:

After structural + quality validation:
- Check if type has `fulfillment.enabled`
- If yes: Run `fractary-core docs doc-validate-fulfillment <id> --json`
- Include fulfillment results in the validation report
- If fulfillment status is `fail` or `partial`, surface specific gaps

This does **not** require a new agent — it extends the existing validator.

---

## Phase 6: Add Work-Linking Capability

**Goal**: Add work-linking as a cross-cutting capability triggered by `work_id` in frontmatter and `workLinking` config in the doc type.

### 6.1 Integrate work-linking into docs-writer

**File**: `plugins/docs/agents/docs-writer.md`

Extend the docs-writer workflow:

After document creation:
1. Check if created doc's type has `workLinking.enabled` and doc has `work_id`
2. If yes and `commentOnCreate`: Auto-detect work-id from branch or frontmatter
3. Fetch work item context via `gh issue view <work_id> --json title,body,comments` for enrichment during creation
4. After creation: Comment on work item via `gh issue comment <work_id> --body "..."`

This is an optional post-creation step — types without `workLinking` are unaffected.

### 6.2 Integrate work-linking into docs-archiver

Already covered in Phase 3.3 (steps 4 and 6 of the archiver agent).

### 6.3 Integrate work-linking into docs-refiner

Already covered in Phase 4.3 (step 5 of the refiner agent).

### 6.4 Work-ID auto-detection

Add a shared utility/instruction block that agents can reference:

```
Work-ID Auto-Detection:
1. Check document frontmatter for work_id field
2. If not present, detect from git branch: feat/123-name → work_id=123
3. If not present, check if user specified --work-id flag
4. If still not present, skip work-linking silently
```

This is the same logic from `plugins/spec/agents/spec-creator.md` step 5, generalized.

---

## Phase 7: Update Doc-Type Selector Skill

**Goal**: Update the doc-type-selector skill to include spec types in its decision tree.

### 7.1 Update selector skill

**File**: `plugins/docs/skills/doc-type-selector/SKILL.md`

Add spec types to the type selection logic:

```
If user is creating a specification or implementation plan:
  → If it's for a new feature: spec-feature
  → If it's for a bug fix: spec-bug
  → If it's for API work: spec-api
  → If it's for infrastructure: spec-infrastructure
  → If it's simple/minimal: spec-basic
```

---

## Phase 8: Wire Up CLI & SDK Exports

### 8.1 Add new CLI commands to docs command tree

**File**: `cli/src/commands/docs/index.ts`

Register the new subcommands:
- `doc-archive` → `createDocArchiveCommand()`
- `doc-refine-scan` → `createDocRefineScanCommand()`
- `doc-validate-fulfillment` → `createDocValidateFulfillmentCommand()`

### 8.2 Export new types from SDK

**File**: `sdk/js/src/docs/index.ts`

Ensure `DocArchiveResult`, `DocRefineResult`, `DocRefinementQuestion`, `DocFulfillmentResult` are exported.

### 8.3 Update SDK common types for backward compatibility

**File**: `sdk/js/src/common/types.ts`

The existing spec types in `common/types.ts` (lines 390-476) should remain for now since the spec plugin still exists. When the spec plugin is removed in a future issue, these types can be deprecated/removed.

---

## Phase 9: Update FABER Integration

**Goal**: Update FABER configuration and docs to call docs CLI commands instead of spec commands.

### 9.1 Update FABER integration documentation

**File**: `plugins/docs/docs/FABER-INTEGRATION.md` (new file)

Document how FABER interacts with the docs plugin for spec types:

```toml
# .faber.config.toml (updated)
[workflow.architect]
  doc_type = "spec-feature"    # Was: spec_plugin = "fractary-spec"
  generate_doc = true
  template = "auto"            # Auto-select spec type based on work type

[workflow.evaluate]
  validate_doc = true
  doc_type = "spec-feature"
  fulfillment_validation = true

[workflow.release]
  archive_doc = true
  doc_type = "spec-feature"
  check_docs_updated = "warn"
```

### 9.2 Create work-type to doc-type mapping

The spec-creator currently auto-selects template based on work type. This mapping moves to configuration:

```yaml
# In docs config or FABER config
work_type_to_doc_type:
  feature: spec-feature
  bug: spec-bug
  api: spec-api
  infrastructure: spec-infrastructure
  chore: spec-basic
  patch: spec-basic
```

---

## Phase 10: Integration Testing & Validation

### 10.1 Test spec doc type creation

```bash
# Create a spec using the docs system
fractary-core docs doc-create test-spec-001 \
  --doc-type spec-feature \
  --title "Add CSV Export" \
  --content "## Overview\nImplement CSV export..." \
  --json

# Verify type info loads correctly
fractary-core docs type-info spec-feature --json
fractary-core docs type-info spec-feature --template
fractary-core docs type-info spec-feature --standards
```

### 10.2 Test archive workflow

```bash
# Configure an archive source
# (in .fractary/config.yaml: file.sources.archive)

# Archive a spec doc
fractary-core docs doc-archive test-spec-001 --json

# Verify archive result
```

### 10.3 Test refinement workflow

```bash
# Scan for gaps
fractary-core docs doc-refine-scan test-spec-001 --json

# Interactive refinement via agent
/fractary-docs:refine test-spec-001
```

### 10.4 Test fulfillment validation

```bash
# Validate implementation completeness
fractary-core docs doc-validate-fulfillment test-spec-001 --json
```

### 10.5 Test work-linking

```bash
# Create spec with work-id
fractary-core docs doc-create work-spec-123 \
  --doc-type spec-feature \
  --title "Add CSV Export" \
  --content "..." \
  --json

# Verify work-linking comment on GitHub issue
```

---

## File Change Summary

### New Files (Templates)

| File | Description |
|------|-------------|
| `templates/docs/spec-basic/type.yaml` | Basic spec type definition |
| `templates/docs/spec-basic/template.md` | Basic spec Mustache template |
| `templates/docs/spec-basic/standards.md` | Basic spec writing standards |
| `templates/docs/spec-feature/type.yaml` | Feature spec type definition |
| `templates/docs/spec-feature/template.md` | Feature spec Mustache template |
| `templates/docs/spec-feature/standards.md` | Feature spec writing standards |
| `templates/docs/spec-bug/type.yaml` | Bug spec type definition |
| `templates/docs/spec-bug/template.md` | Bug spec Mustache template |
| `templates/docs/spec-bug/standards.md` | Bug spec writing standards |
| `templates/docs/spec-api/type.yaml` | API spec type definition |
| `templates/docs/spec-api/template.md` | API spec Mustache template |
| `templates/docs/spec-api/standards.md` | API spec writing standards |
| `templates/docs/spec-infrastructure/type.yaml` | Infra spec type definition |
| `templates/docs/spec-infrastructure/template.md` | Infra spec Mustache template |
| `templates/docs/spec-infrastructure/standards.md` | Infra spec writing standards |

### New Files (Plugin)

| File | Description |
|------|-------------|
| `plugins/docs/agents/docs-refiner.md` | Refinement agent (opus model) |
| `plugins/docs/agents/docs-archiver.md` | Archive agent (haiku model) |
| `plugins/docs/commands/refine.md` | Refine command entry point |
| `plugins/docs/commands/archive.md` | Archive command entry point |
| `plugins/docs/docs/FABER-INTEGRATION.md` | FABER integration guide for docs-based specs |

### New Files (CLI)

No new files — new commands are added to existing `cli/src/commands/docs/doc.ts`.

### Modified Files

| File | Changes |
|------|---------|
| `sdk/js/src/docs/types.ts` | Add archive, workLinking, refinement, fulfillment configs to DocType; add result types |
| `sdk/js/src/docs/type-registry.ts` | Parse new config blocks from type.yaml |
| `sdk/js/src/docs/index.ts` | Export new types |
| `cli/src/commands/docs/doc.ts` | Add doc-archive, doc-refine-scan, doc-validate-fulfillment commands |
| `cli/src/commands/docs/index.ts` | Register new subcommands |
| `plugins/docs/.claude-plugin/plugin.json` | Add docs-refiner, docs-archiver agents |
| `plugins/docs/agents/docs-writer.md` | Add optional work-linking post-creation step |
| `plugins/docs/agents/docs-validator.md` | Add optional fulfillment validation step |
| `plugins/docs/skills/doc-type-selector/SKILL.md` | Add spec types to decision tree |
| `plugins/docs/schemas/spec.schema.json` | Update to align with new type definitions (may split per spec type) |
| `templates/docs/manifest.yaml` | Add 5 spec type entries |

### Untouched (Deferred to Future Issue)

| File/Area | Reason |
|-----------|--------|
| `plugins/spec/` (entire directory) | Left for reference, removed in future issue |
| `sdk/js/src/spec/` (entire directory) | Left for reference, removed in future issue |
| `cli/src/commands/spec/` (CLI commands) | Left functional, removed in future issue |
| `cli/src/cli.ts` (spec command registration) | Left as-is, removed in future issue |
| `cli/src/sdk/factory.ts` (getSpecManager) | Left as-is, removed in future issue |
| `sdk/js/src/common/types.ts` (spec types) | Left as-is, deprecated in future issue |

---

## Implementation Order & Dependencies

```
Phase 1 (SDK types)           ← No dependencies, start here
    ↓
Phase 2 (Spec doc types)      ← Depends on Phase 1 (types must exist)
    ↓
Phase 3 (Archive)             ← Depends on Phase 1 (types) + Phase 2 (types to test with)
Phase 4 (Refinement)          ← Depends on Phase 1 (types) + Phase 2 (types to test with)
Phase 5 (Fulfillment)         ← Depends on Phase 1 (types) + Phase 2 (types to test with)
    ↓                            (Phases 3, 4, 5 are independent of each other)
Phase 6 (Work-linking)        ← Depends on Phases 3, 4 (integrates into archiver, refiner)
    ↓
Phase 7 (Type selector)       ← Depends on Phase 2 (types must exist to select)
Phase 8 (CLI wiring)          ← Depends on Phases 3, 4, 5 (commands must exist)
    ↓
Phase 9 (FABER)               ← Depends on Phases 3-8 (full system must work)
    ↓
Phase 10 (Testing)            ← Depends on all above
```

Phases 3, 4, and 5 can be developed in parallel since they're independent capabilities.

---

## Estimated Scope

| Phase | New Files | Modified Files | Complexity |
|-------|-----------|---------------|------------|
| 1. SDK types | 0 | 3 | Low |
| 2. Spec doc types | 15 | 1 | Medium (mostly content) |
| 3. Archive | 2 | 3 | Medium |
| 4. Refinement | 2 | 1 | Medium-High (agent design) |
| 5. Fulfillment | 0 | 2 | Medium |
| 6. Work-linking | 0 | 3 | Low-Medium |
| 7. Type selector | 0 | 1 | Low |
| 8. CLI wiring | 0 | 2 | Low |
| 9. FABER | 1 | 0 | Low (docs only) |
| 10. Testing | 0 | 0 | Medium |
| **Total** | **20** | **16** | |
