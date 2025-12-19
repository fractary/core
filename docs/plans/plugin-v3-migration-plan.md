# Plugin v3.0 Migration Plan

**Document Type**: Migration Plan
**Created**: 2025-12-18
**Framework Reference**: docs/guides/new-claude-plugin-framework.md
**Status**: Draft

---

## Executive Summary

This plan outlines the migration of all 7 Fractary plugins to the v3.0 architecture. The migration prioritizes **correctness through focus** by replacing manager agents with dedicated agents, converting orchestration skills to expertise skills, and moving platform abstraction to the SDK.

### Current State Summary

| Plugin | Commands | Agents | Skills | V3.0 Alignment | Priority |
|--------|----------|--------|--------|----------------|----------|
| **repo** | 23 | 20 dedicated | 3 expertise + archived | ~85% aligned | Low |
| **work** | 25 | 1 manager | 18 (incl. deprecated handlers) | ~20% aligned | High |
| **docs** | 5 | 1 manager | 10+ orchestration | ~15% aligned | High |
| **logs** | 10 | 1 manager | 13 orchestration | ~15% aligned | Medium |
| **file** | 4 | 1 manager | 8 (incl. handlers) | ~15% aligned | Medium |
| **spec** | 6 | 1 manager | 7 orchestration | ~20% aligned | Medium |
| **status** | 2 | 0 | 2 | ~30% aligned | Low |

---

## V3.0 Principles Checklist

For each plugin, we'll assess against these principles:

1. **Principle 1**: MCP-First Design (deterministic ops → SDK → MCP)
2. **Principle 2**: Dedicated Agents Over Manager Agents
3. **Principle 3**: Skills for Expertise, Not Execution
4. **Principle 4**: Platform Abstraction in SDK
5. **Principle 5**: Ultra-Lightweight Commands with Tool Restriction
6. **Principle 6**: Context Efficiency Through Isolation
7. **Principle 7**: Hybrid Preparation Pattern (when needed)
8. **Principle 8**: Auto-Trigger Everything

---

## Plugin-by-Plugin Assessment & Migration Plan

---

### 1. REPO PLUGIN (fractary-repo) - Priority: LOW

**Current State**: ~85% V3.0 Aligned (Most Advanced)

**What's Working**:
- ✅ 20 dedicated agents for 23 commands (excellent 1:1 ratio)
- ✅ Old skills archived in `archived/` folder
- ✅ 3 expertise skills: `commit-format`, `pr-template`, `code-review-checklist`
- ✅ MCP tools integration (via handlers → SDK)
- ✅ Good documentation

**Gaps Identified**:

| Gap | Issue | Action |
|-----|-------|--------|
| G1 | Some commands may lack `allowed-tools: Task` restriction | Audit all commands |
| G2 | 3 deprecated commands exist (branch.md, pr.md, tag.md) | Remove or redirect |
| G3 | Agent descriptions may need enhancement for auto-triggering | Review/enhance |
| G4 | Some handlers still in skills (source-control handlers) | Move to SDK |

**Migration Tasks**:

```
[ ] Phase 1: Command Audit
    [ ] Review all 23 commands for `allowed-tools: Task` restriction
    [ ] Ensure commands are 8-18 lines (ultra-lightweight)
    [ ] Add parameter-based restrictions: Task(fractary-repo:agent-name)
    [ ] Remove/deprecate legacy commands (branch.md, pr.md, tag.md)

[ ] Phase 2: Agent Enhancement
    [ ] Review all 20 agents for auto-trigger descriptions
    [ ] Add "MUST BE USED" and "Use PROACTIVELY" to descriptions
    [ ] Add trigger phrase examples to each agent
    [ ] Verify model selection (haiku for simple, sonnet for complex)

[ ] Phase 3: Handler Migration to SDK
    [ ] Review handler-source-control-github skill
    [ ] Review handler-source-control-gitlab skill
    [ ] Review handler-source-control-bitbucket skill
    [ ] Plan SDK migration for platform abstraction

[ ] Phase 4: Documentation
    [ ] Update plugin README for v3.0
    [ ] Document MCP tool usage
    [ ] Update migration guide
```

**Estimated Effort**: 2-3 days

---

### 2. WORK PLUGIN (fractary-work) - Priority: HIGH

**Current State**: ~20% V3.0 Aligned

**Major Issues**:
- ❌ Only 1 manager agent for 25 commands (severe anti-pattern)
- ❌ 18 skills including orchestration skills (should be expertise only)
- ❌ 3 deprecated handlers still in skills directory
- ❌ Commands likely lack tool restrictions

**What Needs to Change**:

| Component | Current | Target |
|-----------|---------|--------|
| Agents | 1 manager | 25 dedicated |
| Skills | 18 (orchestration) | ~3-5 (expertise only) |
| Handlers | 3 deprecated | 0 (moved to SDK) |
| Commands | Complex | Ultra-lightweight |

**Migration Tasks**:

```
[ ] Phase 1: Create Dedicated Agents (25 agents)
    [ ] comment-create agent
    [ ] comment-list agent
    [ ] issue-assign agent
    [ ] issue-create agent
    [ ] issue-fetch agent
    [ ] issue-list agent (if different from search)
    [ ] issue-search agent
    [ ] issue-update agent
    [ ] label-add agent
    [ ] label-list agent
    [ ] label-remove agent
    [ ] label-set agent
    [ ] milestone-close agent
    [ ] milestone-create agent
    [ ] milestone-list agent
    [ ] milestone-remove agent
    [ ] milestone-set agent
    [ ] state-close agent
    [ ] state-reopen agent
    [ ] state-transition agent
    [ ] init agent (config wizard)
    [ ] Review compound commands (comment.md, issue.md, label.md, milestone.md, state.md)

[ ] Phase 2: Archive Orchestration Skills
    [ ] Create archived/ directory
    [ ] Move comment-creator → archived/ (logic to agent)
    [ ] Move comment-lister → archived/
    [ ] Move issue-assigner → archived/
    [ ] Move issue-creator → archived/
    [ ] Move issue-fetcher → archived/
    [ ] Move issue-linker → archived/
    [ ] Move issue-searcher → archived/
    [ ] Move issue-updater → archived/
    [ ] Move label-manager → archived/
    [ ] Move milestone-manager → archived/
    [ ] Move state-manager → archived/
    [ ] Move work-initializer → archived/
    [ ] Move handler-work-tracker-* → archived/
    [ ] Create archived/README.md explaining v3.0 migration

[ ] Phase 3: Convert to Expertise Skills
    [ ] Create issue-template skill (organizational standards for issue creation)
    [ ] Create work-conventions skill (labeling conventions, milestone patterns)
    [ ] Keep issue-classifier as expertise (type classification rules)
    [ ] Keep work-common as shared utilities

[ ] Phase 4: Simplify Commands
    [ ] Add `allowed-tools: Task(fractary-work:agent-name)` to all commands
    [ ] Reduce each command to 8-18 lines
    [ ] Show explicit Task tool invocation pattern
    [ ] Remove compound commands or redirect to specific agents

[ ] Phase 5: SDK/MCP Integration
    [ ] Verify MCP tools exist for all work operations
    [ ] If missing, create fractary_work_* MCP tools
    [ ] Move handler logic to SDK

[ ] Phase 6: Documentation
    [ ] Update plugin README
    [ ] Create MIGRATION-v3.0.md
    [ ] Document new agent structure
```

**Estimated Effort**: 5-7 days

---

### 3. DOCS PLUGIN (fractary-docs) - Priority: HIGH

**Current State**: ~15% V3.0 Aligned

**Major Issues**:
- ❌ Only 1 manager agent for 5 commands
- ❌ 10+ orchestration skills (doc-writer, doc-validator, etc.)
- ❌ Complex skill hierarchy (director → manager → operation skills)
- ⚠️ Type-driven design is good but skills execute instead of advise

**What's Good**:
- ✅ Excellent type system (12 document types with schemas/templates)
- ✅ Data-driven approach (93% less code duplication)
- ✅ Well-documented

**What Needs to Change**:

| Component | Current | Target |
|-----------|---------|--------|
| Agents | 1 manager | 5 dedicated |
| Skills | 10+ (orchestration) | ~2-3 (expertise only) |
| Type System | Keep | Keep (it's good!) |
| Commands | Complex routing | Ultra-lightweight |

**Migration Tasks**:

```
[ ] Phase 1: Create Dedicated Agents
    [ ] docs-write agent (handles all doc creation)
    [ ] docs-validate agent (validates documents)
    [ ] docs-audit agent (audits documentation)
    [ ] docs-list agent (lists documents)
    [ ] docs-check-consistency agent (consistency checks)

[ ] Phase 2: Preserve Type System
    [ ] Keep types/ directory structure as-is (it's excellent)
    [ ] Ensure agents can load type context dynamically
    [ ] Move type-loading logic to SDK if not already

[ ] Phase 3: Archive Orchestration Skills
    [ ] Create archived/ directory
    [ ] Move doc-writer → archived/
    [ ] Move doc-validator → archived/
    [ ] Move doc-auditor → archived/
    [ ] Move doc-lister → archived/
    [ ] Move doc-consistency-checker → archived/
    [ ] Move docs-director-skill → archived/
    [ ] Move docs-manager-skill → archived/
    [ ] Create archived/README.md

[ ] Phase 4: Convert to Expertise Skills
    [ ] Create documentation-standards skill (cross-type writing standards)
    [ ] Keep doc-classifier as expertise (document type classification rules)
    [ ] Keep common/ for shared utilities

[ ] Phase 5: Simplify Commands
    [ ] Add `allowed-tools: Task(fractary-docs:agent-name)` to all commands
    [ ] Reduce each command to 8-18 lines
    [ ] Each command invokes its dedicated agent

[ ] Phase 6: SDK/MCP Integration
    [ ] Create/verify fractary_docs_* MCP tools
    [ ] Move doc operations to SDK
    [ ] Agents call MCP tools, not execute scripts

[ ] Phase 7: Documentation
    [ ] Update plugin README for v3.0
    [ ] Create MIGRATION-v3.0.md
```

**Estimated Effort**: 5-7 days

**Special Consideration**: The type-driven design is innovative and should be preserved. The migration focuses on changing WHO executes (agents vs skills) not WHAT is executed.

---

### 4. LOGS PLUGIN (fractary-logs) - Priority: MEDIUM

**Current State**: ~15% V3.0 Aligned

**Major Issues**:
- ❌ Only 1 manager agent for 10 commands
- ❌ 13 orchestration skills
- ⚠️ Type-driven design (11 log types) - same pattern as docs

**Migration Tasks**:

```
[ ] Phase 1: Create Dedicated Agents (10 agents)
    [ ] log-analyze agent
    [ ] log-archive agent
    [ ] log-audit agent
    [ ] log-capture agent
    [ ] log-cleanup agent
    [ ] log-init agent
    [ ] log-write agent (for log.md command)
    [ ] log-read agent
    [ ] log-search agent
    [ ] log-stop agent

[ ] Phase 2: Archive Orchestration Skills
    [ ] Move log-analyzer → archived/
    [ ] Move log-archiver → archived/
    [ ] Move log-auditor → archived/
    [ ] Move log-capturer → archived/
    [ ] Move log-lister → archived/
    [ ] Move log-searcher → archived/
    [ ] Move log-summarizer → archived/
    [ ] Move log-validator → archived/
    [ ] Move log-writer → archived/
    [ ] Move log-director-skill → archived/
    [ ] Move log-manager-skill → archived/
    [ ] Create archived/README.md

[ ] Phase 3: Convert to Expertise Skills
    [ ] Create log-format-standards skill (log formatting conventions)
    [ ] Keep log-classifier as expertise
    [ ] Keep workflow-event-emitter if it's event publication only

[ ] Phase 4: Preserve Type System
    [ ] Keep types/ directory (11 log types)
    [ ] Ensure agents can load type context

[ ] Phase 5: Simplify Commands & MCP Integration
    [ ] Add tool restrictions to commands
    [ ] Create/verify fractary_logs_* MCP tools

[ ] Phase 6: Documentation
    [ ] Update README
    [ ] Consolidate MIGRATION-CONFIG-v2.0.md and MIGRATION-v2.0.md
```

**Estimated Effort**: 4-5 days

---

### 5. FILE PLUGIN (fractary-file) - Priority: MEDIUM

**Current State**: ~15% V3.0 Aligned

**Major Issues**:
- ❌ Only 1 manager agent for 4 commands
- ❌ 5 handler skills for storage backends (should be in SDK)
- ⚠️ Handler pattern (platform abstraction in skills, not SDK)

**Migration Tasks**:

```
[ ] Phase 1: Create Dedicated Agents (4 agents)
    [ ] file-init agent (config wizard)
    [ ] file-show-config agent
    [ ] file-switch-handler agent
    [ ] file-test-connection agent

[ ] Phase 2: Move Handlers to SDK
    [ ] Move handler-storage-local logic to SDK
    [ ] Move handler-storage-r2 logic to SDK
    [ ] Move handler-storage-s3 logic to SDK
    [ ] Move handler-storage-gcs logic to SDK
    [ ] Move handler-storage-gdrive logic to SDK
    [ ] Create unified StorageManager in SDK

[ ] Phase 3: Archive Old Skills
    [ ] Move handler-* skills to archived/
    [ ] Move file-manager skill to archived/
    [ ] Move config-wizard skill to archived/ (logic to agent)

[ ] Phase 4: Create MCP Tools
    [ ] fractary_file_upload
    [ ] fractary_file_download
    [ ] fractary_file_list
    [ ] fractary_file_delete
    [ ] fractary_file_config_get
    [ ] fractary_file_config_set

[ ] Phase 5: Simplify Commands
    [ ] Add tool restrictions
    [ ] Reduce to 8-18 lines each

[ ] Phase 6: Documentation
    [ ] Update README
    [ ] Create MIGRATION-v3.0.md
```

**Estimated Effort**: 4-5 days

---

### 6. SPEC PLUGIN (fractary-spec) - Priority: MEDIUM

**Current State**: ~20% V3.0 Aligned

**Major Issues**:
- ❌ Only 1 manager agent for 6 commands
- ❌ 7 orchestration skills

**Migration Tasks**:

```
[ ] Phase 1: Create Dedicated Agents (6 agents)
    [ ] spec-archive agent
    [ ] spec-create agent
    [ ] spec-init agent
    [ ] spec-read agent
    [ ] spec-refine agent
    [ ] spec-validate agent

[ ] Phase 2: Archive Orchestration Skills
    [ ] Move spec-archiver → archived/
    [ ] Move spec-generator → archived/
    [ ] Move spec-initializer → archived/
    [ ] Move spec-linker → archived/
    [ ] Move spec-refiner → archived/
    [ ] Move spec-updater → archived/
    [ ] Move spec-validator → archived/
    [ ] Create archived/README.md

[ ] Phase 3: Create Expertise Skills
    [ ] Create spec-format-standards skill (specification formatting rules)
    [ ] Create spec-quality-checklist skill (what makes a good spec)

[ ] Phase 4: Create MCP Tools & SDK
    [ ] fractary_spec_create
    [ ] fractary_spec_read
    [ ] fractary_spec_validate
    [ ] fractary_spec_archive

[ ] Phase 5: Simplify Commands
    [ ] Add tool restrictions
    [ ] Reduce to 8-18 lines

[ ] Phase 6: Documentation
    [ ] Update README
    [ ] Update FABER-INTEGRATION.md
```

**Estimated Effort**: 3-4 days

---

### 7. STATUS PLUGIN (fractary-status) - Priority: LOW

**Current State**: ~30% V3.0 Aligned

**Assessment**: This is a small plugin (2 commands, 2 skills) focused on status line management.

**Migration Tasks**:

```
[ ] Phase 1: Create Dedicated Agents (2 agents)
    [ ] status-install agent
    [ ] status-sync agent

[ ] Phase 2: Evaluate Skills
    [ ] Review status-line-manager - may be expertise or archived
    [ ] Review status-syncer - may be expertise or archived

[ ] Phase 3: Simplify Commands
    [ ] Add tool restrictions
    [ ] Reduce to 8-18 lines

[ ] Phase 4: Documentation
    [ ] Update README
```

**Estimated Effort**: 1-2 days

---

## Migration Execution Order

Based on priority and dependencies:

### Wave 1: Foundation (Week 1-2)
1. **repo** - Complete remaining 15% alignment (template for others)
2. **status** - Quick win, small scope

### Wave 2: High Priority (Week 2-4)
3. **work** - Most used, high impact
4. **docs** - Sets pattern for type-driven plugins

### Wave 3: Medium Priority (Week 4-6)
5. **logs** - Similar to docs, apply patterns
6. **file** - Handler migration to SDK
7. **spec** - Straightforward migration

---

## Common Patterns to Apply

### 1. Agent Template

```markdown
---
name: fractary-{plugin}:{operation}
description: {What it does}. MUST BE USED for all {operation} operations. Use PROACTIVELY when user requests {operation}.
tools: fractary_{plugin}_{tool1}, fractary_{plugin}_{tool2}
model: claude-haiku-4-5
---

# {Operation} Agent

## Description
{Detailed description}

## Use Cases
**Use this agent when:**
- {Trigger pattern 1}
- {Trigger pattern 2}

**Examples:**
- "{Example request 1}"
- "{Example request 2}"

## Workflow

<WORKFLOW>
1. {Step 1}
2. {Step 2}
3. {Step 3}
</WORKFLOW>

## Output
{What this returns}
```

### 2. Command Template

```markdown
---
name: fractary-{plugin}:{command}
description: {Brief description} - delegates to agent
allowed-tools: Task(fractary-{plugin}:{agent})
model: claude-haiku-4-5
argument-hint: '[arg1] [--option <value>]'
---

Use **Task** tool with `fractary-{plugin}:{agent}` subagent:

Task(
  subagent_type="fractary-{plugin}:{agent}",
  description="{Short description}",
  prompt="{Operation}: {args}"
)
```

### 3. Expertise Skill Template

```markdown
---
name: {plugin}-{standard-name}
description: Organizational standards for {topic}
---

# {Standard Name}

## Purpose
{Why this standard exists}

## Standards

### {Category 1}
- {Rule 1}
- {Rule 2}

### {Category 2}
- {Rule 3}
- {Rule 4}

## Examples

**Good:**
```
{Good example}
```

**Bad:**
```
{Bad example}
```
```

### 4. Archive README Template

```markdown
# Archived Components (v2.0)

**Archived Date**: {date}
**Migration Reference**: docs/guides/new-claude-plugin-framework.md

## Why Archived

These components were part of the v2.0 skill-centric architecture. In v3.0:
- Orchestration skills → Dedicated agents
- Handlers → SDK
- Scripts → MCP tools

## Contents

| Component | Previous Purpose | V3.0 Replacement |
|-----------|-----------------|------------------|
| {skill-1} | {what it did} | {agent/MCP tool} |
| {skill-2} | {what it did} | {agent/MCP tool} |

## Reference Only

These files are kept for reference during migration but are NOT active.
```

---

## Success Metrics

### Per-Plugin Metrics

| Metric | Target |
|--------|--------|
| Commands with `allowed-tools: Task` | 100% |
| Dedicated agents per command | 1:1 ratio |
| Skills that are expertise-only | 100% |
| Handlers in plugins | 0 (all in SDK) |
| Command line count | 8-18 lines |
| Agent auto-trigger descriptions | All have examples |

### Overall Metrics

| Metric | Before | After |
|--------|--------|-------|
| Manager agents | 6 | 0 |
| Dedicated agents | ~22 | ~75 |
| Orchestration skills | ~70 | 0 |
| Expertise skills | ~5 | ~15-20 |
| Platform handlers in plugins | ~8 | 0 |

---

## Risk Mitigation

### Risk 1: Breaking Changes
**Mitigation**: Archive old components, don't delete. Users can reference archived code.

### Risk 2: Missing MCP Tools
**Mitigation**: Audit MCP tools before migration. Create missing tools first.

### Risk 3: Lost Functionality
**Mitigation**: Test each operation before/after migration. Document any behavior changes.

### Risk 4: Context Overhead
**Mitigation**: Keep agents focused. Use expertise skills only when standards matter.

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Audit MCP tools** - ensure all required tools exist
3. **Start Wave 1** - repo and status plugins
4. **Create templates** - standardized agent/command templates
5. **Execute Wave 2-3** - following patterns from Wave 1

---

## Appendix A: File Counts by Plugin

| Plugin | Commands | Agents | Skills | Scripts | Types |
|--------|----------|--------|--------|---------|-------|
| docs | 5 | 1 | 10+ | 63 | 12 |
| file | 4 | 1 | 8 | 38 | 0 |
| logs | 10 | 1 | 13 | 45 | 11 |
| repo | 23 | 20 | 3+11 archived | 24 | 0 |
| spec | 6 | 1 | 7 | - | 0 |
| status | 2 | 0 | 2 | 3 | 0 |
| work | 25 | 1 | 18 | 79 | 0 |

## Appendix B: MCP Tool Requirements

### Required MCP Tools (verify existence)

**fractary-repo** (likely exists):
- fractary_repo_branch_create
- fractary_repo_branch_delete
- fractary_repo_branch_list
- fractary_repo_commit
- fractary_repo_push
- fractary_repo_pull
- fractary_repo_pr_create
- fractary_repo_pr_merge
- fractary_repo_pr_review
- fractary_repo_tag_create
- fractary_repo_worktree_create

**fractary-work** (verify/create):
- fractary_work_issue_create
- fractary_work_issue_fetch
- fractary_work_issue_update
- fractary_work_issue_search
- fractary_work_comment_create
- fractary_work_comment_list
- fractary_work_label_add
- fractary_work_label_remove
- fractary_work_milestone_set
- fractary_work_state_transition

**fractary-docs** (verify/create):
- fractary_docs_write
- fractary_docs_validate
- fractary_docs_audit
- fractary_docs_list
- fractary_docs_type_load

**fractary-logs** (verify/create):
- fractary_logs_write
- fractary_logs_read
- fractary_logs_search
- fractary_logs_archive
- fractary_logs_capture

**fractary-file** (verify/create):
- fractary_file_upload
- fractary_file_download
- fractary_file_list
- fractary_file_delete

**fractary-spec** (verify/create):
- fractary_spec_create
- fractary_spec_read
- fractary_spec_validate
- fractary_spec_archive

---

*Document generated: 2025-12-18*
*Framework version: v3.0*
