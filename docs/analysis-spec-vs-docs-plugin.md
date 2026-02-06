# Analysis: Spec Plugin vs. Docs Plugin — Should Specs Be a Doc Type?

## Executive Summary

After thorough analysis of the spec, docs, logs, and file plugins across their CLI, SDK, agent, and template layers, **the spec plugin should be eliminated and its spec types absorbed as doc types within the docs plugin**. The behaviors initially identified as "spec-specific" — refinement, archiving, GitHub work-linking, implementation validation — are not inherently spec-only capabilities; they are **general-purpose document capabilities the docs plugin should have anyway**. The file plugin's handler/source architecture already provides the mechanism for configurable archival. The logs plugin demonstrates that archival, retention, and lifecycle management are not foreign concepts for document-like systems within fractary.

**Recommendation: Full merge (Option B revised). Eliminate the spec plugin. Absorb spec types as doc types. Add refinement, archival, and work-linking as first-class docs capabilities available to any doc type.**

---

## 1. What They Share (The Overlap)

### Storage Model — Nearly Identical

| Aspect | Spec | Docs |
|--------|------|------|
| File format | Markdown + YAML frontmatter | Markdown + YAML frontmatter |
| Storage location | `.fractary/specs/` | `docs/{type}/` |
| Metadata | YAML frontmatter fields | YAML frontmatter fields |
| Content | Markdown body with sections | Markdown body with sections |
| Naming | Pattern-based (`WORK-{id}-{slug}.md`) | Pattern-based (`ADR-{number}-{slug}.md`) |

Both are markdown files with YAML frontmatter. The fundamental storage unit is identical.

### Template Systems — Same Concept, Different Maturity

**Spec templates**: hardcoded TypeScript objects with 5 templates (basic, feature, infrastructure, api, bug).

**Docs templates**: data-driven Mustache templates + YAML type definitions with 11 core types and custom type extensibility. Adding a type = adding 3 data files, no code changes.

The docs system is strictly more capable. Spec templates are a less mature version of the same concept.

### CRUD Operations — Functionally Equivalent

| Operation | Spec CLI | Docs CLI |
|-----------|----------|----------|
| Create | `spec-create-file` | `doc-create` |
| Read | `spec-get` | `doc-get` |
| List | `spec-list` | `doc-list` |
| Update | `spec-update` | `doc-update` |
| Delete | `spec-delete` | `doc-delete` |
| Validate | `spec-validate-check` | `validate` |
| List Types | `template-list` | `type-list` |

The SDK managers (`SpecManager`, `DocsManager`) implement nearly the same interface.

### Validation — Overlapping Core

Both validate: required frontmatter fields, required sections, status values, structural completeness scoring. The structural validation mechanics are the same.

---

## 2. Why the "Spec-Specific" Behaviors Are Actually Generic

My initial analysis identified 4 behaviors as "genuinely spec-specific." On deeper examination, **every one of them is a general document capability that other doc types would benefit from**.

### 2.1 Refinement Is Not Spec-Specific

The spec-refiner scans for gaps, generates questions, collects answers, and applies improvements. But **any document type benefits from this**:

- An **API doc** should be refined: "What error code is returned when auth fails? What's the rate limit?"
- An **architecture doc** should be refined: "What happens when service X is unavailable? What's the failover strategy?"
- An **ADR** should be refined: "What alternatives were considered? What are the long-term consequences?"
- A **standards doc** should be refined: "What are the edge cases for this rule? When should exceptions be made?"

Refinement is a **document quality process**, not a specification process. The docs plugin should have a `docs-refiner` agent that works on any doc type. The refiner can load type-specific standards and required sections from the type definition to generate contextually relevant questions. The spec-refiner's GitHub integration (posting questions to issues) is a concern of work-linking, not refinement itself.

### 2.2 Archiving Is Not Spec-Specific — And the File Plugin Already Solves It

The spec-archiver moves files to an archive location with checksum verification. But:

- **Changelogs** should be archivable (old versions → archive).
- **Audit docs** should be archivable (completed audits → cold storage).
- **Test plans** should be archivable (deprecated test plans → archive).
- The **logs plugin already has sophisticated archival** with per-type retention policies, cloud backup, and configurable thresholds.

The **file plugin's source/handler system** already provides the infrastructure:

```yaml
# .fractary/config.yaml
file:
  sources:
    archive:
      type: s3
      bucket: my-archive-bucket
      prefix: "archive/docs/"
    local-archive:
      type: local
      basePath: ".fractary/archive/"
```

Archival for docs becomes: **configure an archive file source in `config.yaml`, then add an `archive` config to any doc type's `type.yaml`**:

```yaml
# templates/docs/spec-feature/type.yaml
archive:
  enabled: true
  source: archive           # References file plugin source
  trigger: manual           # Or: on_status_change, on_work_complete
  verify_checksum: true
  delete_original: true
  retention_days: forever
```

This is strictly more flexible than the spec-archiver's hardcoded behavior. Any doc type can opt into archival with its own rules. The spec types configure `trigger: on_work_complete` while an audit type might use `trigger: on_status_change` (when status → "completed"). The underlying file operation delegates to whatever handler is configured — local, S3, R2, GCS.

The spec-archiver's "check if GitHub issue is closed before archiving" is a **pre-condition check**, not an archive operation. That belongs in a work-linking layer (see 2.4 below).

### 2.3 Implementation Validation Is Just a Validation Mode

Spec validation checks whether reality matches the contract (requirements met, tests written, acceptance criteria checked). But this is not a different *system* — it's a different *validation mode*.

The docs plugin already supports two validation dimensions:
1. **Structural validation**: Is the document well-formed? (frontmatter, sections, schema)
2. **Quality validation**: Does the document meet standards? (via `standards.md`)

Implementation validation is a third dimension:
3. **Fulfillment validation**: Does the external world match what the document describes?

This could be modeled as an optional `validation.fulfillment` section in `type.yaml`:

```yaml
# templates/docs/spec-feature/type.yaml
validation:
  structural: true              # Standard doc validation
  quality: true                 # Standards compliance
  fulfillment:                  # NEW: implementation checking
    enabled: true
    check_acceptance_criteria: true
    check_files_modified: true
    check_tests_added: true
    check_docs_updated: true
```

Only spec types would enable fulfillment validation. ADRs, guides, and API docs wouldn't. But the validation *framework* is generic — the docs-validator agent just needs to check for a `fulfillment` config and run additional checks when present.

### 2.4 GitHub Work-Linking Is a Cross-Cutting Concern

The spec plugin's GitHub integration (fetching issue data, commenting on issues, checking issue state) is **not about specs at all**. It's about **linking any artifact to a work item**. This is a cross-cutting concern that belongs in its own abstraction:

```
Work-Linking (generic capability):
  ├── Fetch work item context (issue title, description, comments)
  ├── Link artifact to work item (comment on issue with artifact reference)
  ├── Check work item state (open/closed/merged)
  └── Auto-detect work-id from git branch

Applicable to:
  ├── Spec docs (current)
  ├── Test reports ("Tests passed for #123")
  ├── Architecture docs linked to implementation issues
  ├── Changelog entries linked to releases
  └── Any doc type with a work_id frontmatter field
```

This could live as a docs plugin capability triggered by the presence of `work_id` in frontmatter, or as a separate lightweight work-linking plugin that the docs plugin can call. Either way, it's not a reason for the spec plugin to exist.

### 2.5 FABER Integration Doesn't Require a Separate Plugin

FABER calls spec operations during its phases (Architect → generate spec, Evaluate → validate spec, Release → archive spec). But FABER already knows how to call CLI commands. If spec types are doc types, FABER simply calls:

```bash
# Architect phase
fractary-core docs doc-create <id> --doc-type spec-feature --json

# Evaluate phase
fractary-core docs validate <id> --json

# Release phase
fractary-core docs archive <id> --json
```

The FABER config changes from `spec_plugin = "fractary-spec"` to `doc_type = "spec-feature"`. The phase logic doesn't care whether the underlying system is a spec plugin or the docs plugin.

### 2.6 Conversation-to-Doc Generation Is Generic

The spec-creator synthesizes a document from conversation context + external data. But this is exactly what `docs-writer` does — it creates a document from context using a template. The spec-creator just also fetches GitHub issue data as additional context. With work-linking as a generic capability, the docs-writer can do the same: detect `work_id`, fetch issue data, merge into template context, create doc.

---

## 3. What the Docs Plugin Gains From the Merge

| New Capability | Source | Benefit to Non-Spec Doc Types |
|---------------|--------|------------------------------|
| Refinement (refine command) | spec-refiner | API docs, ADRs, architecture docs, guides all benefit from gap scanning and Q&A-driven improvement |
| Archival (archive command) | spec-archiver + file plugin sources | Changelogs, audits, deprecated standards, old test plans can be archived with per-type retention policies |
| Work-linking | spec-creator/archiver | Test reports, changelogs, any doc can be linked to GitHub issues |
| Fulfillment validation | spec-validator | Any doc type can optionally validate against external state |
| Conversation-to-doc generation | spec-creator | Any doc type benefits from richer context gathering during creation |
| Changelog tracking | spec-refiner | Any doc can maintain a refinement history |

The docs plugin becomes a more complete document lifecycle system, not a bloated one.

---

## 4. Precedent: The Logs Plugin

The logs plugin demonstrates that **archival, retention, and lifecycle management work perfectly within a type-based document system**. Logs has:

- 9 log types with type-specific retention policies
- Automatic cloud archival via file plugin integration
- Per-type archive triggers and retention rules
- Checksum verification
- Validation before archival (require summary, redaction checks)

This is exactly the pattern docs should adopt. The logs plugin proves the concept is viable and battle-tested. If logs can have archive-on-retention-expiry, docs can have archive-on-work-complete.

---

## 5. Revised Recommendation: Full Merge

### Eliminate the spec plugin entirely. Absorb everything into docs + file + optional work-linking.

```
┌──────────────────────────────────────────────────────────────────┐
│                        docs plugin (enhanced)                     │
│                                                                   │
│  Storage · Templates · CRUD · Type Registry · Indexing · Audit   │
│  Structural + Quality + Fulfillment Validation                   │
│  Refinement (NEW) · Archival via file sources (NEW)              │
│  Work-linking via work_id frontmatter (NEW)                      │
│                                                                   │
│  Doc Types:                                                       │
│  ├── adr, api, architecture, audit, changelog, dataset, etl     │
│  ├── guides, infrastructure, standards, testing                  │
│  └── spec-feature, spec-bug, spec-api, spec-infra, spec-basic   │  ← NEW
└──────────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────────┐  ┌──────────────────────────────────┐
│  file plugin         │  │  work-linking (new capability)    │
│  (archive sources)   │  │  GitHub issue fetch/comment/state │
│  S3 · R2 · GCS ·    │  │  Auto-detect work-id from branch  │
│  local · GDrive      │  │  Triggered by work_id in          │
│                      │  │  frontmatter of any doc type      │
└─────────────────────┘  └──────────────────────────────────┘
```

### What Moves Where

| Current Spec Component | Destination | Rationale |
|----------------------|-------------|-----------|
| 5 spec templates (basic, feature, bug, api, infra) | `templates/docs/spec-*/` as doc types | Type system unification |
| spec-creator agent | Enhanced docs-writer with work-linking | Conversation-to-doc + issue enrichment is generic |
| spec-validator agent | Enhanced docs-validator with fulfillment mode | Configurable per type via `validation.fulfillment` |
| spec-refiner agent | **New docs-refiner agent** (benefits all types) | Gap scanning + Q&A is a document quality process |
| spec-archiver agent | **New docs-archiver agent** + file sources | Archive config per type, file handler does the work |
| SpecManager SDK | DocsManager (extended) | Storage/CRUD is identical |
| Spec CLI commands | Docs CLI commands | No spec-specific CLI needed |
| GitHub commenting | Work-linking capability | Cross-cutting concern, not doc-type-specific |
| FABER integration | FABER calls docs CLI with `--doc-type spec-*` | No change in FABER's ability to orchestrate |

### New Doc Type Definition Example

```yaml
# templates/docs/spec-feature/type.yaml
id: spec-feature
display_name: Feature Specification
description: Specification for new feature implementation

output_path: specs

file_naming:
  pattern: "WORK-{work_id}-{slug}.md"
  fallback_pattern: "SPEC-{timestamp}-{slug}.md"

frontmatter:
  required_fields: [title, fractary_doc_type, status, date]
  optional_fields: [work_id, source, validation_status, changelog, tags, author, related_specs]
  defaults:
    fractary_doc_type: spec-feature
    status: draft
    source: conversation

structure:
  required_sections: [Overview, Requirements, Acceptance Criteria, Technical Approach]
  optional_sections: [Background, Scope, Non-Goals, Dependencies, Migration, Risks]

status:
  allowed_values: [draft, review, approved, in-progress, completed, archived]
  default: draft

# NEW: Archive configuration (delegates to file plugin sources)
archive:
  enabled: true
  source: archive              # Named file source from config.yaml
  trigger: on_status_change    # Archive when status → "archived"
  verify_checksum: true
  delete_original: true

# NEW: Fulfillment validation (only for spec types)
validation:
  fulfillment:
    enabled: true
    check_acceptance_criteria: true
    check_files_modified: true
    check_tests_added: true
    check_docs_updated: true

# NEW: Work-linking (any doc type with work_id gets this)
work_linking:
  enabled: true
  comment_on_create: true
  comment_on_archive: true
  require_closed_for_archive: true

# NEW: Refinement configuration
refinement:
  enabled: true
  post_questions_to_work_item: true
  maintain_changelog: true

index_config:
  index_file: specs/README.md
  sort_by: date
  sort_order: desc
  entry_template: "- [**{{work_id}}**: {{title}}]({{relative_path}}) — {{status}}"
```

### New Agents for the Docs Plugin

| Agent | Model | Purpose | Available to All Types? |
|-------|-------|---------|------------------------|
| docs-writer | haiku | Create/update docs (existing) | Yes |
| docs-validator | haiku | Validate docs (existing, extended with fulfillment mode) | Yes (fulfillment opt-in per type) |
| docs-auditor | haiku | Audit doc corpus (existing) | Yes |
| docs-consistency-checker | haiku | Check docs vs code drift (existing) | Yes |
| **docs-refiner** | **opus** | **Scan for gaps, generate questions, Q&A, apply improvements** | **Yes** |
| **docs-archiver** | **haiku** | **Archive docs via file sources, checksum, cleanup** | **Yes (opt-in per type)** |

---

## 6. Migration Path

### Phase 1: Create Spec Doc Types
- Create `templates/docs/spec-feature/`, `spec-bug/`, `spec-infrastructure/`, `spec-api/`, `spec-basic/`
- Each with `type.yaml`, `template.md`, `standards.md`
- Port the 5 hardcoded spec templates into the docs Mustache + YAML format
- Add spec-specific frontmatter fields and archive/validation/refinement config

### Phase 2: Add New Docs Capabilities
- **docs-refiner agent**: Port spec-refiner logic, generalize to work with any doc type's required sections and standards
- **docs-archiver agent**: Port spec-archiver logic, delegate file operations to file plugin sources, make archive trigger configurable per type
- **Work-linking capability**: Extract GitHub operations into a reusable capability triggered by `work_id` in frontmatter
- **Fulfillment validation mode**: Add optional fulfillment checks to docs-validator, configured per type

### Phase 3: Migrate Spec Storage
- Update `DocsManager` to handle spec-specific frontmatter fields
- Map existing spec files to the new doc type format (minimal changes)
- Update FABER config to call docs CLI instead of spec CLI

### Phase 4: Deprecate Spec Plugin
- Remove spec plugin agents, commands, skills
- Remove `SpecManager` SDK (DocsManager handles everything)
- Remove spec CLI commands (docs CLI handles everything)
- Archive spec plugin code for reference

### Phase 5: Enhance
- Specs automatically get: auto-indexing, auditing, consistency checking, custom type extensibility, JSON Schema validation, standards enforcement
- Any new doc type can opt into archival, refinement, fulfillment validation, or work-linking by adding config to its `type.yaml`

---

## 7. What We Gain

### Code Reduction
- Eliminate `SpecManager` SDK (~791 lines)
- Eliminate spec CLI commands (~417 lines)
- Eliminate 5 pure-CRUD spec agents
- Eliminate spec template TypeScript objects
- Eliminate duplicated validation logic
- **Estimated savings: ~2,000+ lines of duplicated code**

### Feature Multiplication
- 11 existing doc types gain optional access to: refinement, archival, work-linking, fulfillment validation
- Adding a new spec type (e.g., `spec-migration`, `spec-security`) = adding 3 data files, no code
- Archive behavior is configurable per type, not hardcoded for specs only

### Architectural Simplification
- One document system, not two
- One template system, not two
- One validation framework, not two
- One CRUD interface, not two
- Clear composition: docs (storage/types) + file (handlers/sources) + work-linking (GitHub)

### Consistency
- All document types use the same Mustache templates, standards, indexing, and validation
- Spec naming, frontmatter, and structure follow the same conventions as every other doc type
- One CLI to learn, one SDK to maintain

---

## 8. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Migration breaks FABER integration | Medium | Phase 3 includes FABER config update; FABER just calls different CLI commands |
| Docs plugin becomes bloated | Low | New capabilities are opt-in per type via config; types that don't need archival/refinement aren't affected |
| Losing spec-specific UX | Low | Spec doc types have the same `type.yaml` expressiveness; agents load type context at runtime |
| Work-linking abstraction is premature | Low | Start with GitHub-only; the abstraction allows future JIRA/Linear support but doesn't require it |
| Existing spec files need migration | Low | Frontmatter changes are minimal (rename `type` → `fractary_doc_type`); body structure is compatible |

---

## 9. Conclusion

The spec plugin is not a fundamentally different system — it's a less mature version of the docs plugin with four additional capabilities (refinement, archiving, work-linking, fulfillment validation) that **every doc type would benefit from**. The file plugin already provides the handler/source infrastructure for configurable archival. The logs plugin already proves that type-specific lifecycle and retention rules work within a type-based document system.

Rather than maintaining two parallel document systems and adding templates to specs (reimplementing what docs already has), the right move is to **absorb spec types into docs and uplift the docs plugin with the genuinely valuable capabilities the spec plugin introduced**. The result is a single, more capable document system where "spec" is just a category of document with specific configuration for archival, validation, and work-linking — the same way "ADR" is a category with specific configuration for numbering and immutability.
