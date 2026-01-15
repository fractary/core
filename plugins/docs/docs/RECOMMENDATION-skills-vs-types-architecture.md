# Recommendation: Skills vs Types Architecture for Document Formatting

**Date**: 2025-01-15
**Status**: Recommendation
**Author**: Claude (Analysis Request)
**Context**: Evaluating whether to convert the docs plugin's "types" system to use the skills architecture

---

## Executive Summary

**Recommendation: Hybrid Approach** - Keep the types system for structured configuration (templates, schemas, validation) while adding a **skill layer** for discoverability and organizational knowledge.

The current types system is well-architected for its purpose. Converting it entirely to skills would lose significant functionality (JSON schemas, template rendering, index configuration). However, adding a skill layer on top provides the discoverability and Claude-native interaction benefits you're seeking.

---

## Background

### What We Have Today

**Types System** (`plugins/docs/types/`)
- 11 document types: ADR, API, architecture, audit, changelog, dataset, ETL, guides, infrastructure, standards, testing
- Each type has 5 configuration files:
  - `schema.json` - JSON Schema (Draft 7) for frontmatter validation
  - `template.md` - Mustache template for document structure
  - `standards.md` - Writing guidelines and best practices
  - `validation-rules.md` - Type-specific quality checks
  - `index-config.json` - Index organization configuration
- Achieved **93% code reduction** from v1.x type-specific skills (documented in ADR-001)

**Skills Architecture** (`plugins/*/skills/`)
- Skills provide **organizational knowledge and expertise** (v3.0 purpose)
- Markdown files with YAML frontmatter + sections (CONTEXT, CRITICAL_RULES, WORKFLOW)
- Agents READ skills to gain expertise, then execute operations following standards
- Examples: `fractary-commit-format`, `fractary-pr-template`, `fractary-code-review-checklist`

### Why This Question Arose

The concern is that:
1. **Discoverability**: Skills are more discoverable by Claude (registered in marketplace, loaded as context)
2. **Extensibility**: Users familiar with adding skills might find it easier to add new document types
3. **Claude Leverage**: Claude might more naturally leverage skills vs custom type directories
4. **Consistency**: Other knowledge (commit format, PR template) uses skills; docs uses types

---

## Analysis

### What Skills Provide That Types Don't

| Capability | Skills | Types |
|------------|--------|-------|
| Claude-native discovery | ✅ Via marketplace registration | ❌ Requires agent knowledge |
| Single-file simplicity | ✅ One markdown file | ❌ 5 files per type |
| Organizational standards | ✅ Primary purpose | ⚠️ standards.md only |
| Auto-invocation hints | ✅ Description field | ❌ None |
| Framework familiarity | ✅ Common pattern | ⚠️ Docs-specific pattern |

### What Types Provide That Skills Don't

| Capability | Types | Skills |
|------------|-------|--------|
| JSON Schema validation | ✅ schema.json | ❌ Not supported |
| Template rendering (Mustache) | ✅ template.md with {{variables}} | ❌ No template system |
| Index configuration | ✅ index-config.json | ❌ No equivalent |
| Structured validation rules | ✅ validation-rules.md | ⚠️ Would be prose only |
| Frontmatter field specs | ✅ Typed, validated | ❌ Unstructured |
| Dual-format documents | ✅ README + schema.json | ❌ No support |

### Why Types Were Designed This Way

The docs plugin underwent a deliberate architectural evolution (documented in ADR-001):

**v1.x Architecture** (Type-Specific Skills):
```
11 type-specific skills
├─ docs-manage-api (500 lines)
├─ docs-manage-adr (500 lines)
├─ docs-manage-architecture (500 lines)
└─ ... (8 more)
```
- **93% code duplication**
- Adding new type = 500+ lines
- 7,000+ lines total

**v2.0 Architecture** (Operation-Specific + Type Context):
```
4 operation-specific agents (universal)
├─ docs-write (handles ANY doc_type)
├─ docs-validate (handles ANY doc_type)
├─ docs-list (handles ANY doc_type)
└─ docs-audit (handles ANY doc_type)

+ Type context in types/{doc_type}/
├─ schema.json
├─ template.md
├─ standards.md
├─ validation-rules.md
└─ index-config.json
```
- **<7% code duplication**
- Adding new type = 5 data files (~200 lines)
- 2,500 lines total

**Key Insight**: The types system is essentially a **data-driven configuration system**, not an execution system. Skills in v3.0 are for expertise/knowledge, not configuration.

---

## Options Evaluated

### Option A: Convert Types to Skills (One Skill Per Type)

```
plugins/docs/skills/
├── doc-type-adr/SKILL.md
├── doc-type-api/SKILL.md
├── doc-type-architecture/SKILL.md
└── ... (11+ skills)
```

**Pros**:
- More discoverable via skill registration
- Familiar pattern for users
- Single file per type

**Cons**:
- ❌ **Goes back to type-specific components** (what they migrated AWAY from)
- ❌ **Loses JSON Schema validation** - Can't express validation rules as effectively
- ❌ **Loses Mustache templating** - Would need prose descriptions instead
- ❌ **Loses index configuration** - No structured way to specify index behavior
- ❌ **Undoes 93% code reduction** - Would increase duplication again
- ❌ **Skills aren't meant for this** - v3.0 skills are for expertise, not configuration

**Recommendation**: ❌ **Not recommended** - Loses too much functionality

### Option B: Single Document Formatter Skill

```
plugins/docs/skills/
└── doc-formatter/SKILL.md  (references types/)
```

A single skill that:
- Provides document formatting expertise
- Explains how the types system works
- Guides Claude on selecting and using types

**Pros**:
- Adds discoverability layer
- Keeps types system intact
- Low implementation effort

**Cons**:
- ⚠️ Doesn't help users extend with new types
- ⚠️ Still requires understanding types/ directory structure

**Recommendation**: ⚠️ **Partial solution** - Helps discoverability but not extensibility

### Option C: Hybrid Approach with Skill Layer (Recommended)

```
plugins/docs/skills/
├── documentation-knowledge/SKILL.md    # Organizational doc standards
├── doc-type-guide/SKILL.md             # How to choose types
├── doc-authoring-standards/SKILL.md    # Writing best practices
└── extending-doc-types/SKILL.md        # How to add new types

plugins/docs/types/  # Unchanged
├── adr/
├── api/
└── ...
```

Skills provide:
- **Organizational knowledge** about documentation strategy
- **Guidance on type selection** (when to use ADR vs architecture doc)
- **Writing standards** that apply across all types
- **Extension guide** for adding new types

Types continue to provide:
- Templates, schemas, validation rules
- Type-specific configuration
- Machine-parseable definitions

**Pros**:
- ✅ **Adds discoverability** via skill registration
- ✅ **Preserves functionality** of types system
- ✅ **Enables Claude leverage** - Skills guide Claude to use types correctly
- ✅ **Improves extensibility** - Extension skill teaches how to add types
- ✅ **Follows v3.0 patterns** - Skills for expertise, not execution
- ✅ **No migration needed** - Additive change only

**Cons**:
- ⚠️ Two systems to understand (skills + types)
- ⚠️ More files overall

**Recommendation**: ✅ **Recommended** - Best of both worlds

### Option D: Wait for MCP-Based Type Registry

An alternative future architecture where types are registered via MCP:

```typescript
// MCP tool for type discovery
server.tool({
  name: "fractary_docs_types_list",
  description: "List available document types"
}, async () => {
  return types.map(t => ({
    name: t.name,
    description: t.description,
    schema: t.schema
  }));
});
```

**Pros**:
- Native integration with Claude's tool system
- Structured type information
- Future-proof architecture

**Cons**:
- ⚠️ Requires MCP development work
- ⚠️ Doesn't address immediate needs
- ⚠️ May not improve user extensibility

**Recommendation**: ⚠️ **Good future enhancement** - Consider alongside Option C

---

## Recommended Implementation: Hybrid Approach

### Phase 1: Add Documentation Knowledge Skills

Create skills that make the types system more discoverable and provide organizational guidance.

**Skill 1: `documentation-strategy/SKILL.md`**
```markdown
---
name: fractary-documentation-strategy
description: Organizational documentation standards and strategy for Fractary projects
---

# Documentation Strategy

## When to Create Documentation

1. **ADRs**: For architectural decisions with lasting impact
2. **API Docs**: For any service endpoint (internal or external)
3. **Architecture**: For system design and component relationships
...

## Documentation Principles

- Living documentation (keep updated)
- Single source of truth
- Link extensively
...
```

**Skill 2: `doc-type-selection/SKILL.md`**
```markdown
---
name: fractary-doc-type-selection
description: Guide for selecting the right document type
---

# Choosing the Right Document Type

## Decision Tree

**Is it recording a decision?**
→ Use ADR (Architecture Decision Record)

**Is it documenting an API endpoint?**
→ Use API documentation (supports OpenAPI dual-format)

**Is it explaining system architecture?**
→ Use Architecture documentation
...

## Type Comparison Matrix

| Need | Type | Why |
|------|------|-----|
| Record a decision | ADR | Immutable, auditable |
| Document API | API | Dual-format with OpenAPI |
| Explain system | Architecture | Component diagrams |
...
```

**Skill 3: `extending-doc-types/SKILL.md`**
```markdown
---
name: fractary-extending-doc-types
description: Guide for adding new document types to the docs plugin
---

# Adding New Document Types

## Required Files

Create `plugins/docs/types/{new_type}/` with 5 files:

1. **schema.json** - Define frontmatter fields
2. **template.md** - Mustache template for structure
3. **standards.md** - Writing guidelines
4. **validation-rules.md** - Quality checks
5. **index-config.json** - Index organization

## Step-by-Step

### 1. Create schema.json
```json
{
  "type": "my-type",
  "display_name": "My Document Type",
  "frontmatter": {
    "required_fields": ["title", "type", "date"],
    ...
  }
}
```
...

## Examples

See existing types for reference:
- `types/adr/` - Simple type with immutability rules
- `types/api/` - Dual-format with OpenAPI support
- `types/architecture/` - Subtypes pattern
```

### Phase 2: Register Skills in Plugin Manifest

Update `plugins/docs/.claude-plugin/plugin.json`:

```json
{
  "name": "fractary-docs",
  "version": "2.3.0",
  "description": "Type-agnostic documentation system with operation-specific skills and data-driven type context",
  "commands": "./commands/",
  "agents": [...],
  "skills": "./skills/"
}
```

### Phase 3: Update Agents to Reference Skills

Update agents like `docs-write.md` to reference the new skills:

```markdown
<WORKFLOW>
1. Read fractary-doc-type-selection skill to understand type choice
2. Read fractary-documentation-strategy for organizational standards
3. Load type context from types/{doc_type}/
4. Execute write operation
...
</WORKFLOW>
```

### Phase 4: Update Documentation

- Update README.md with skill references
- Document the dual system (skills for knowledge, types for config)
- Add examples of extending the system

---

## Impact Assessment

### For Claude Discoverability

**Before**: Claude needs to know about the `types/` directory structure
**After**: Claude discovers skills that explain and guide to types

### For User Extensibility

**Before**: Users must understand 5-file structure in types/
**After**: Users read `extending-doc-types` skill for guidance, follow pattern

### For Organizational Standards

**Before**: Standards scattered across 11 type directories
**After**: Cross-cutting standards in skills, type-specific in types/

### For Existing Functionality

**Impact**: None - This is purely additive

---

## Success Metrics

1. **Discoverability**: Claude proactively suggests document types when user mentions documentation
2. **Extensibility**: Users can add new types by following skill guidance
3. **Adoption**: New document types follow the standard pattern
4. **Quality**: Documents pass validation more consistently

---

## Conclusion

The types system is well-designed for its technical purpose (templates, schemas, validation, indexing). Converting it to skills would lose significant functionality.

However, the discoverability and organizational knowledge concerns are valid. The **hybrid approach** addresses these by:

1. **Adding skills** for organizational knowledge and guidance
2. **Keeping types** for technical configuration
3. **Connecting them** via agent workflows

This gives you the best of both worlds: the structured power of the types system, plus the discoverability and Claude-native interaction of skills.

---

## Next Steps

1. [ ] Review and approve this recommendation
2. [ ] Create the three initial skills (strategy, type selection, extending)
3. [ ] Update plugin.json to register skills
4. [ ] Update agent workflows to reference skills
5. [ ] Test Claude's improved discoverability
6. [ ] Document the dual system in README

---

## Appendix: Comparison with Other Systems

### How Other Plugins Handle Similar Problems

**file plugin (storage handlers)**:
- Uses `skills/handler-storage-*/SKILL.md` pattern
- Each handler is a skill with configuration docs
- Works because handlers are expertise-based (how to use S3, GCS, etc.)

**repo plugin (commit format)**:
- Uses `skills/commit-format.md` single skill
- Pure knowledge/standards (no configuration needed)
- Works because it's expertise, not templates

**docs plugin (document types)**:
- Uses `types/*/` with 5-file structure
- Requires templates, schemas, validation
- Skills pattern would lose functionality

**Conclusion**: The docs plugin's types are more like the file plugin's handler configurations than the repo plugin's standards. The hybrid approach acknowledges this distinction.
