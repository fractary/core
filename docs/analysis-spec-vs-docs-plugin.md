# Analysis: Spec Plugin vs. Docs Plugin — Should Specs Be a Doc Type?

## Executive Summary

After a thorough analysis of both plugins across their CLI, SDK, agent, and template layers, **the spec plugin shares ~70% of its infrastructure with the docs plugin** (storage, frontmatter, templates, CRUD, validation scaffolding) but has **~30% of genuinely distinct workflow behavior** that doesn't map cleanly onto the docs model. The recommendation is to **consolidate the storage/template/CRUD layer** but **preserve spec-specific workflow logic** as a thin layer on top — effectively making "spec" a doc type for storage purposes while keeping a focused spec-workflow plugin for lifecycle management.

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

### Template Systems — Same Concept, Different Implementations

**Spec templates** are defined as TypeScript objects with structured `TemplateSection[]` arrays:
```typescript
// spec/templates.ts
SpecTemplate {
  id: string          // "feature", "bug", "api", etc.
  name: string
  description: string
  sections: TemplateSection[]  // { title, required, description }
}
```

**Docs templates** use the more mature data-driven approach with Mustache templates + YAML type definitions:
```yaml
# templates/docs/{type}/type.yaml
id: adr
file_naming: { pattern: "ADR-{number}-{slug}.md", auto_number: true }
frontmatter: { required_fields: [...], optional_fields: [...] }
structure: { required_sections: [...], optional_sections: [...] }
```

Both define: required/optional sections, frontmatter schemas, naming patterns, and default values. The docs system is simply more mature and extensible.

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

The SDK managers (`SpecManager`, `DocsManager`) implement nearly the same interface: `create()`, `read()`, `update()`, `delete()`, `list()`, `search()`, plus validation.

### Three-Layer Architecture — Identical Pattern

Both follow: **Commands** (entry points) → **Agents** (AI orchestration) → **CLI** (deterministic operations). Both use the same plugin structure (`.claude-plugin/plugin.json`, `agents/`, `commands/`, `skills/`).

### Validation — Overlapping Core

Both validate:
- Required frontmatter fields present
- Required sections present in markdown body
- Status values within allowed set
- Structural completeness scoring

---

## 2. What Makes Specs Genuinely Different (The 30%)

### 2.1 GitHub Issue/PR Lifecycle Binding

This is the single largest differentiator. Specs are **work artifacts tied to GitHub issues**, not standalone documents.

- **spec-creator**: Auto-detects `work-id` from git branch (`feat/123-name` → issue #123), fetches issue data via `gh`, merges conversation context with issue context, comments on GitHub when spec is created
- **spec-archiver**: Refuses to archive unless the linked issue is CLOSED or PR is merged, comments archive summary on GitHub
- **spec-refiner**: Posts refinement questions to GitHub issues for team visibility

Docs have **zero GitHub integration**. Documents are standalone content with no external lifecycle binding.

### 2.2 Ephemeral vs. Permanent Lifecycle

Specs are designed to be **ephemeral** — they exist during active work and get archived when that work completes. The archival is triggered by external events (issue closure, PR merge, FABER release phase).

Docs are designed to be **permanent** — they persist as long-lived reference material. There is no concept of "this document's purpose has been fulfilled, archive it."

This is a fundamental philosophical difference in document lifecycle.

### 2.3 Implementation Validation (Not Just Structural)

Spec validation checks whether **the implementation fulfills the specification**:
- Requirements coverage: are checkboxed requirements checked off?
- Acceptance criteria: are all criteria met?
- Files modified: were the right files changed?
- Tests added: were tests written?
- Docs updated: was documentation changed?

Docs validation checks whether **the document itself is well-formed**:
- Frontmatter schema compliance
- Required sections present
- Links resolve
- Formatting quality

Spec validation is **outward-facing** (does reality match the spec?). Docs validation is **inward-facing** (is the doc itself correct?).

### 2.4 Interactive Refinement

The spec-refiner agent (claude-opus-4-6) does something docs have no equivalent for:
1. Scans for specification gaps (vague requirements, missing edge cases)
2. Generates pointed questions ("What happens when X?", "How should Y handle Z?")
3. Posts questions to GitHub for team discussion
4. Collects answers through interactive Q&A
5. Applies improvements and logs a changelog entry

This is a **collaborative specification tightening process**, not documentation editing.

### 2.5 FABER Workflow Integration

Specs are deeply woven into FABER phases:
- **Architect**: Generate spec from issue
- **Build**: Spec serves as implementation contract
- **Evaluate**: Validate implementation against spec
- **Release**: Archive spec, clean up

Docs participate in FABER only tangentially (consistency checks).

### 2.6 Conversation-to-Spec Generation

spec-creator uses claude-opus-4-6 to synthesize a specification from:
- The current conversation context (primary source)
- GitHub issue data (enrichment)
- Auto-selected template based on work type

This "extract a contract from a discussion" behavior has no docs equivalent.

---

## 3. What the Docs Plugin Has That Specs Lack

| Capability | Docs | Specs |
|------------|------|-------|
| Custom type extensibility | Yes (add YAML/MD files) | No (hardcoded 5 templates) |
| Mustache template rendering | Yes | No (TypeScript objects) |
| Standards documents per type | Yes | No |
| Auto-indexing (README generation) | Yes | No |
| Audit (corpus health scan) | Yes | No |
| Code consistency checking | Yes | No |
| Tags / categorization | Yes | No |
| Multiple output formats | Yes (md/html/pdf/text) | No (markdown only) |
| JSON Schema validation | Yes | No |
| Hierarchical organization | Yes | No |
| Sidecar metadata support | Yes | No |

If specs became a doc type, they'd inherit all of this for free.

---

## 4. Architectural Options

### Option A: Keep Separate (Status Quo)

**Pros**: No migration work; clear separation of concerns
**Cons**: Duplicated infrastructure (~70% overlap); spec templates can't benefit from docs maturity; maintaining two parallel CRUD/storage/validation systems; adding features like templates to specs means reimplementing what docs already has

### Option B: Merge Completely (Eliminate Spec Plugin)

Make specs a doc type within docs. Add spec-specific behaviors as configuration.

**Pros**: Single storage/template/CRUD/validation system; specs get custom types, indexing, auditing, standards for free; massive code reduction
**Cons**: The GitHub lifecycle, implementation validation, refinement, and archival-on-close behaviors would need to be shoehorned into the docs system; risks bloating the docs plugin with workflow logic that doesn't belong there; "ephemeral work artifact" and "permanent reference document" are different enough to cause abstraction leakage

### Option C: Hybrid — Shared Base, Spec Workflow Layer (Recommended)

1. **Make "spec" a doc type** in the docs system for storage, templates, CRUD, and structural validation
2. **Keep a thin spec-workflow plugin** that adds:
   - GitHub issue/PR lifecycle binding
   - Implementation validation (requirements → code mapping)
   - Interactive refinement with Q&A
   - Lifecycle-triggered archival
   - FABER phase integration
   - Conversation-to-spec generation

```
┌────────────────────────────────────────────────┐
│           spec-workflow plugin (thin)           │
│  GitHub binding · Implementation validation     │
│  Refinement Q&A · Lifecycle archival · FABER    │
├────────────────────────────────────────────────┤
│           docs plugin (base layer)              │
│  Storage · Templates · CRUD · Type Registry     │
│  Structural Validation · Indexing · Auditing    │
└────────────────────────────────────────────────┘
```

**Pros**:
- Eliminates duplicated infrastructure
- Specs benefit from docs' mature type system (Mustache templates, standards, custom types, indexing, auditing)
- Spec-specific workflow logic stays focused and maintainable
- Adding spec templates becomes trivial (add YAML/MD files to `templates/docs/spec-feature/`, etc.)
- Clear architectural boundary: docs owns *what a document is*, spec-workflow owns *how specs participate in work*

**Cons**:
- Migration effort required
- Spec-workflow plugin depends on docs plugin (coupling)
- Need to ensure docs plugin's extension points support spec's lifecycle needs

---

## 5. Recommendation

**Option C (Hybrid)** is the right path. Here's why:

1. **The overlap is too large to justify two systems.** Maintaining parallel CRUD, storage, template, and validation implementations for what is fundamentally "a markdown file with frontmatter" is unjustifiable overhead.

2. **The differences are real but narrow.** The spec-specific behaviors (GitHub binding, implementation validation, refinement, lifecycle archival) are important but don't require a separate storage/template/CRUD stack. They're workflow behaviors that layer on top of document management.

3. **You were about to add templates to specs.** The fact that you wanted to add the same template concept that docs already has is a strong signal that the infrastructure is being duplicated. With Option C, spec templates are just doc type definitions — you'd add `templates/docs/spec-feature/`, `templates/docs/spec-bug/`, etc., each with `type.yaml`, `template.md`, and `standards.md`.

4. **The analogy is clean.** In most systems, a "ticket" and a "wiki page" share the same base (title, body, metadata) but tickets have workflow rules (state machines, assignment, lifecycle triggers) that wiki pages don't. Nobody argues they need separate storage engines. The docs plugin is the storage engine; the spec-workflow plugin is the workflow layer.

---

## 6. Migration Path (If Option C Is Pursued)

### Phase 1: Define Spec Doc Types
- Create `templates/docs/spec-feature/`, `spec-bug/`, `spec-infrastructure/`, `spec-api/`, `spec-basic/` with `type.yaml`, `template.md`, `standards.md`
- Port the 5 hardcoded spec templates into the docs type system
- Add spec-specific frontmatter fields to type definitions (`work_id`, `validation_status`, `source`, `changelog`)

### Phase 2: Migrate Spec Storage to Docs
- Update `SpecManager` to delegate storage operations to `DocsManager`
- Map spec CRUD operations to docs CRUD with `docType: "spec-feature"` etc.
- Migrate existing spec files to docs-compatible format (minimal changes — just frontmatter field alignment)

### Phase 3: Slim Down Spec Plugin
- Remove duplicated CRUD agents/commands (spec-getter, spec-lister, spec-updater, spec-deleter)
- Keep workflow agents: spec-creator, spec-validator, spec-refiner, spec-archiver
- Update workflow agents to use `fractary-core docs` commands for storage, add spec-specific logic on top

### Phase 4: Enhance with Docs Features
- Specs automatically get: indexing, auditing, consistency checking, custom type extensibility, standards enforcement, JSON Schema validation

---

## 7. Concrete Overlap Metrics

| Component | Spec Implementation | Docs Equivalent | Overlap % |
|-----------|-------------------|-----------------|-----------|
| SDK Manager | `spec/manager.ts` (791 lines) | `docs/manager.ts` | ~75% |
| SDK Types | `spec/types.ts` | `docs/types.ts` | ~60% |
| Templates | `spec/templates.ts` (hardcoded) | `templates/docs/*/type.yaml` | ~80% conceptual |
| CLI Commands | `spec.ts` (417 lines) | `docs/index.ts` | ~70% |
| Agents (CRUD) | 5 agents (getter, lister, updater, deleter, template-lister) | 1 agent (docs-writer) + CLI | ~90% |
| Agents (Workflow) | 4 agents (creator, validator, refiner, archiver) | No equivalent | 0% |
| Storage Format | Markdown + YAML frontmatter | Markdown + YAML frontmatter | ~95% |
| Plugin Structure | `.claude-plugin/`, `agents/`, `commands/` | Same | 100% |

**Bottom line**: ~5 of 9 spec agents are pure CRUD that duplicate docs functionality. ~4 agents contain genuinely unique workflow logic worth preserving.
