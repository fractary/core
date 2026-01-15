# Recommendation: Skills vs Types Architecture for Document Formatting

**Date**: 2025-01-15
**Status**: Recommendation (Revised)
**Author**: Claude (Analysis Request)
**Context**: Evaluating whether to convert the docs plugin's "types" system to use the skills architecture

---

## Executive Summary

**Recommendation: One Skill Per Document Type** - Migrate the current `types/` directory structure into `skills/doc-type-{name}/` directories, with each skill containing all supporting files (schema.json, template.md, etc.).

This approach leverages the key insight that **skill directories can contain any file types** - not just SKILL.md. Combined with the **~100 character description limit** for skill auto-discovery, having separate skills per document type enables Claude to naturally discover and leverage the right type based on user intent.

---

## Key Insight: Skills Are Containers

Skills are not just a single markdown file. A skill directory can contain:
- `SKILL.md` - The skill definition with description for auto-discovery
- `schema.json` - JSON Schema validation
- `template.md` - Mustache templates
- `standards.md` - Writing guidelines
- `validation-rules.md` - Quality checks
- `index-config.json` - Index organization
- `scripts/` - Any helper scripts
- `docs/` - Additional documentation
- Any other supporting files

This means the current `types/{doc_type}/` structure can live **inside** skill directories without losing any functionality.

---

## The Description Limit Problem

Skill descriptions are limited to approximately **100 characters** and are the primary mechanism for Claude's auto-discovery. This creates a critical architectural decision:

### Single Skill Approach (NOT Recommended)

```markdown
# doc-formatter/SKILL.md
---
name: fractary-doc-formatter
description: Document formatting for ADR, API, architecture, audit, changelog, dataset, ETL, guides...
---
```

**Problems**:
- ❌ Can't list all 11 types in ~100 characters
- ❌ Claude can't auto-trigger on specific type mentions
- ❌ "Create an ADR" won't match well
- ❌ Synonyms for each type can't be included

### One Skill Per Type (RECOMMENDED)

```markdown
# doc-type-adr/SKILL.md
---
name: fractary-doc-adr
description: Architecture Decision Record. Use for technical decisions, design choices, decision logs.
---

# doc-type-api/SKILL.md
---
name: fractary-doc-api
description: API documentation with OpenAPI. Use for REST endpoints, service APIs, endpoint docs.
---

# doc-type-architecture/SKILL.md
---
name: fractary-doc-architecture
description: System architecture docs. Use for component diagrams, system design, infrastructure.
---
```

**Benefits**:
- ✅ Each type has focused description with synonyms
- ✅ "Create an ADR" → matches doc-type-adr
- ✅ "Document this API endpoint" → matches doc-type-api
- ✅ "Record why we chose PostgreSQL" → matches doc-type-adr (decision-related)
- ✅ Claude naturally discovers the right type

---

## Recommended Architecture

### Directory Structure

```
plugins/docs/skills/
├── doc-type-adr/
│   ├── SKILL.md              # Description + expertise for ADRs
│   ├── schema.json           # ADR frontmatter schema
│   ├── template.md           # ADR document template
│   ├── standards.md          # ADR writing guidelines
│   ├── validation-rules.md   # ADR quality checks
│   └── index-config.json     # ADR index organization
│
├── doc-type-api/
│   ├── SKILL.md              # Description for API docs
│   ├── schema.json
│   ├── template.md
│   ├── standards.md
│   ├── validation-rules.md
│   └── index-config.json
│
├── doc-type-architecture/
│   ├── SKILL.md
│   ├── schema.json
│   ├── template.md
│   ├── standards.md
│   ├── validation-rules.md
│   └── index-config.json
│
├── doc-type-audit/
│   └── ... (same pattern)
│
├── doc-type-changelog/
│   └── ...
│
├── doc-type-dataset/
│   └── ...
│
├── doc-type-etl/
│   └── ...
│
├── doc-type-guides/
│   └── ...
│
├── doc-type-infrastructure/
│   └── ...
│
├── doc-type-standards/
│   └── ...
│
├── doc-type-testing/
│   └── ...
│
└── doc-type-selector/
    └── SKILL.md              # Fallback for type selection
```

### Skill Definitions

Each type skill should have a rich description with synonyms:

**doc-type-adr/SKILL.md**
```markdown
---
name: fractary-doc-adr
description: Architecture Decision Record (ADR). Use for technical decisions, design choices, architectural patterns, decision logs.
model: claude-haiku-4-5
---

<CONTEXT>
You are an expert in creating Architecture Decision Records (ADRs).
ADRs document significant technical decisions with their context, alternatives considered, and rationale.
</CONTEXT>

<WHEN_TO_USE>
Use this skill when the user wants to:
- Record a technical or architectural decision
- Document why a technology was chosen
- Create a decision log entry
- Capture design rationale
- Record trade-offs considered

Common triggers:
- "Create an ADR for..."
- "Document this decision..."
- "Record why we chose..."
- "Capture the rationale for..."
</WHEN_TO_USE>

<SUPPORTING_FILES>
This skill includes:
- schema.json: Frontmatter validation (status, decision-makers, date)
- template.md: Standard ADR structure (Context, Decision, Consequences)
- standards.md: Writing guidelines (immutability rules, status transitions)
- validation-rules.md: Quality checks (required sections, formatting)
- index-config.json: How ADRs are organized in indices
</SUPPORTING_FILES>

<WORKFLOW>
1. Load schema.json for frontmatter requirements
2. Load template.md for document structure
3. Apply standards.md guidelines during writing
4. Validate against validation-rules.md
5. Update index per index-config.json
</WORKFLOW>
```

**doc-type-api/SKILL.md**
```markdown
---
name: fractary-doc-api
description: API documentation with OpenAPI support. Use for REST endpoints, service APIs, GraphQL, endpoint docs.
model: claude-haiku-4-5
---

<CONTEXT>
You are an expert in creating API documentation.
API docs can be dual-format: README.md for humans + OpenAPI spec for tooling.
</CONTEXT>

<WHEN_TO_USE>
Use this skill when the user wants to:
- Document an API endpoint
- Create OpenAPI/Swagger specs
- Write service documentation
- Document REST or GraphQL APIs

Common triggers:
- "Create API docs for..."
- "Document this endpoint..."
- "Write API documentation..."
- "Generate OpenAPI spec..."
</WHEN_TO_USE>

...
```

**doc-type-selector/SKILL.md** (Fallback)
```markdown
---
name: fractary-doc-type-selector
description: Helps select the right document type when unclear. Use when creating docs without a specific type.
model: claude-haiku-4-5
---

<CONTEXT>
You help users select the appropriate document type when they want to create documentation but haven't specified which type.
</CONTEXT>

<DECISION_TREE>
Ask clarifying questions or infer from context:

**Is it recording a decision?**
→ Use doc-type-adr (Architecture Decision Record)

**Is it documenting an API or endpoint?**
→ Use doc-type-api (API documentation)

**Is it explaining system design or components?**
→ Use doc-type-architecture (Architecture documentation)

**Is it a security or compliance audit?**
→ Use doc-type-audit (Audit documentation)

**Is it tracking changes over time?**
→ Use doc-type-changelog (Changelog)

**Is it about data sources or schemas?**
→ Use doc-type-dataset (Dataset documentation)

**Is it about data pipelines or transformations?**
→ Use doc-type-etl (ETL documentation)

**Is it a how-to or tutorial?**
→ Use doc-type-guides (Guide documentation)

**Is it about infrastructure or deployment?**
→ Use doc-type-infrastructure (Infrastructure documentation)

**Is it defining rules or conventions?**
→ Use doc-type-standards (Standards documentation)

**Is it about testing strategies or test plans?**
→ Use doc-type-testing (Testing documentation)
</DECISION_TREE>

<WORKFLOW>
1. Analyze user request for type indicators
2. If clear → invoke appropriate doc-type-* skill
3. If unclear → ask clarifying question
4. Once type selected → delegate to that skill
</WORKFLOW>
```

---

## Migration Plan

### Phase 1: Create Skill Directories

```bash
# Create new skill directories
mkdir -p plugins/docs/skills/doc-type-{adr,api,architecture,audit,changelog,dataset,etl,guides,infrastructure,standards,testing,selector}

# Move existing type files into skill directories
for type in adr api architecture audit changelog dataset etl guides infrastructure standards testing; do
  mv plugins/docs/types/$type/* plugins/docs/skills/doc-type-$type/
done
```

### Phase 2: Create SKILL.md for Each Type

Create a SKILL.md file in each directory with:
- Focused description (~100 chars) with synonyms
- WHEN_TO_USE section with triggers
- SUPPORTING_FILES reference
- WORKFLOW for how to use the files

### Phase 3: Update Agents

Update `docs-write.md` and other agents to:
1. Look for skills in `skills/doc-type-*/`
2. Load skill's supporting files (schema.json, template.md, etc.)
3. Follow skill's workflow

### Phase 4: Archive Old Types Directory

```bash
# Archive for reference
mv plugins/docs/types plugins/docs/archived/types-v2

# Document the migration
echo "Migrated to skills/doc-type-* pattern for better Claude discoverability" > plugins/docs/archived/types-v2/README.md
```

### Phase 5: Update Plugin Manifest

```json
{
  "name": "fractary-docs",
  "version": "3.0.0",
  "description": "Documentation system with per-type skills for automatic Claude discovery",
  "commands": "./commands/",
  "agents": [...],
  "skills": "./skills/"
}
```

---

## How Claude Discovery Works

### Before (Types System)

```
User: "Create an ADR for our database choice"

Claude: [Needs to know about types/ directory]
        [Must be told about ADR type]
        [No automatic discovery]
```

### After (Skills Per Type)

```
User: "Create an ADR for our database choice"

Claude: [Scans skill descriptions]
        [Matches "ADR" and "decision" in doc-type-adr description]
        [Auto-invokes fractary-doc-adr skill]
        [Loads schema.json, template.md, etc. from skill directory]
        [Creates properly formatted ADR]
```

### Synonym Matching Examples

| User Says | Matches Skill | Why |
|-----------|---------------|-----|
| "Create an ADR" | doc-type-adr | "ADR" in description |
| "Document this decision" | doc-type-adr | "decision" in description |
| "Record why we chose X" | doc-type-adr | "decision", "chose" patterns |
| "Write API docs" | doc-type-api | "API" in description |
| "Document this endpoint" | doc-type-api | "endpoint" in description |
| "Create architecture overview" | doc-type-architecture | "architecture" in description |
| "Explain the system design" | doc-type-architecture | "system design" pattern |
| "Write a how-to guide" | doc-type-guides | "guide", "how-to" patterns |
| "Document the ETL pipeline" | doc-type-etl | "ETL", "pipeline" in description |

---

## Extensibility Benefits

### For Users Adding New Types

With skills, adding a new document type is:

1. Create `skills/doc-type-{newtype}/`
2. Add SKILL.md with description and synonyms
3. Add schema.json, template.md, etc.
4. Done - Claude automatically discovers it

The skill's description makes it discoverable. No need to modify agents or update documentation indices manually.

### Example: Adding a "runbook" Type

```
plugins/docs/skills/doc-type-runbook/
├── SKILL.md
├── schema.json
├── template.md
├── standards.md
├── validation-rules.md
└── index-config.json
```

**SKILL.md**
```markdown
---
name: fractary-doc-runbook
description: Operational runbook. Use for incident response, on-call procedures, operational playbooks.
model: claude-haiku-4-5
---

<CONTEXT>
You are an expert in creating operational runbooks.
Runbooks document step-by-step procedures for operations tasks.
</CONTEXT>

<WHEN_TO_USE>
- "Create a runbook for..."
- "Document the incident response..."
- "Write an on-call playbook..."
- "Create operational procedures..."
</WHEN_TO_USE>
```

Now "Create a runbook for database failover" automatically triggers this skill.

---

## Comparison with Previous Analysis

### What Changed

| Aspect | Previous Analysis | Corrected Understanding |
|--------|-------------------|------------------------|
| Skill structure | Single markdown file | Directory with any files |
| JSON Schema support | ❌ Lost in skills | ✅ Kept in skill directory |
| Template support | ❌ Lost in skills | ✅ Kept in skill directory |
| Architecture recommendation | Hybrid (skills + types) | Full migration to skills |

### Why This Is Better

1. **Single location** - All type info in one skill directory
2. **Better discoverability** - Description per type with synonyms
3. **Simpler mental model** - Just skills, no types/ separate system
4. **Consistent with file plugin** - Same pattern as handler-storage-* skills
5. **User extensibility** - Add new type = add new skill directory

---

## Conclusion

The **one skill per document type** architecture provides:

1. **Automatic Claude discovery** via focused descriptions with synonyms
2. **Full functionality** by keeping all supporting files in skill directories
3. **Easy extensibility** - new types are just new skill directories
4. **Consistency** with how other plugins (file, work) structure their skills
5. **Better user experience** - Claude naturally picks the right type

The doc-type-selector skill serves as a fallback when the user's intent doesn't clearly match a specific type, helping guide them to the right choice.

---

## Next Steps

1. [ ] Review and approve this revised recommendation
2. [ ] Migrate types/ directories to skills/doc-type-*/
3. [ ] Create SKILL.md for each type with synonyms
4. [ ] Create doc-type-selector fallback skill
5. [ ] Update agents to load from skills
6. [ ] Test Claude's automatic type discovery
7. [ ] Archive old types/ directory
8. [ ] Update documentation
