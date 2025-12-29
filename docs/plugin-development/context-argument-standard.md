# Context Argument Standard

**Standard for the `--context` argument across all Fractary Core plugin commands**

## Overview

All Fractary Core plugin commands support the `--context "<text>"` argument, providing users with the ability to pass additional contextual instructions to any command. This makes standardized commands more adaptable to specific circumstances or project requirements.

## Specification

### Argument Format

```
--context "<text>"
```

- **Position**: Always the **final optional argument** in any command
- **Format**: Quoted string containing additional instructions
- **Scope**: Available on ALL 41 plugin commands

### Command Argument Hint Format

```yaml
# Commands with no other arguments
argument-hint: '[--context "<text>"]'

# Commands with required arguments
argument-hint: '<required-arg> [--context "<text>"]'

# Commands with optional arguments
argument-hint: '[--optional-arg] [--context "<text>"]'

# Commands with both
argument-hint: '<required-arg> [--optional1] [--optional2] [--context "<text>"]'
```

## Agent Handling

Agents that receive the `--context` argument should:

1. **Parse arguments** including `--context`
2. **Prepend context as additional instructions** to their workflow
3. **Apply context as primary directive modifier** influencing decision-making throughout

### Standard Agent Sections

#### ARGUMENTS Section

```markdown
<ARGUMENTS>
[... existing arguments ...]
- `--context "<text>"` - Optional: Additional instructions prepended to workflow
</ARGUMENTS>
```

#### WORKFLOW Section

```markdown
<WORKFLOW>
1. Parse arguments (..., --context)
2. If --context provided, apply as additional instructions to workflow
3. [Continue with normal workflow steps]
</WORKFLOW>
```

#### CRITICAL_RULES Section (if applicable)

```markdown
<CRITICAL_RULES>
[... existing rules ...]
N. With --context, prepend as additional instructions to workflow
</CRITICAL_RULES>
```

## Usage Examples

### Basic Usage

```bash
# Add context to any command
/fractary-docs:write api --context "Focus on error handling and include rate limiting info"

/fractary-spec:create --work-id 123 --context "Prioritize security requirements"

/fractary-repo:commit "Add feature" --context "Ensure conventional commit format"
```

### Context Influences Behavior

```bash
# Different contexts can adapt the same command
/fractary-docs:validate --context "Be strict about code examples"
/fractary-docs:validate --context "Focus on structure, ignore minor style issues"

# Context guides decision-making
/fractary-work:issue-refine --context "Emphasize performance requirements"
```

### Complex Context

```bash
# Multi-aspect context
/fractary-spec:create --work-id 456 --context "This is a high-priority security feature. Include threat modeling section. Focus on API boundaries."
```

## Implementation Checklist

When adding `--context` support to a new command or agent:

### For Commands

- [ ] Add `[--context "<text>"]` as final argument in `argument-hint`
- [ ] Keep it optional (square brackets)
- [ ] Ensure it's always last in the argument list

### For Agents

- [ ] Add to ARGUMENTS section with standard description
- [ ] Add parsing step in WORKFLOW (step 1 or 2)
- [ ] Add handling step: "If --context provided, apply as additional instructions"
- [ ] Consider adding to CRITICAL_RULES if agent has that section

## Migration from --prompt

Prior to standardization, some commands used `--prompt` for similar functionality. These have been migrated to `--context` for consistency:

**Migrated commands:**
- `fractary-spec:create` (--prompt -> --context)
- `fractary-spec:refine` (--prompt -> --context)
- `fractary-docs:write` (--prompt -> --context)
- `fractary-work:issue-refine` (--prompt -> --context)

**Note**: `--prompt` is deprecated. All new development should use `--context`.

## Design Rationale

### Why "context" over "prompt"?

- **Semantic clarity**: "context" better describes additional situational information
- **Consistency**: Standardized term across all plugins
- **Differentiation**: Distinguishes from agent "prompts" which are internal

### Why always last?

- **Predictability**: Users always know where to find it
- **Parsing simplicity**: Easier argument parsing in agents
- **Flexibility**: Can contain any text without conflicting with positional args

### Why optional for all commands?

- **Backward compatibility**: Existing usage patterns continue to work
- **Flexibility**: Commands work without context but can be customized
- **Universal applicability**: Even simple commands can benefit from context

## Validation

Use the validation script to verify all commands and agents have proper `--context` support:

```bash
./scripts/validate-context-support.sh
```

This script checks:
- All commands have `--context` in argument-hint
- All agents have `--context` in ARGUMENTS section
- No deprecated `--prompt` references in non-archived files

## Related Documentation

- [Plugin Development Guide](../guides/new-claude-plugin-framework.md)
- [Agent Development Standards](../guides/configuration.md)
- Individual plugin READMEs for command-specific documentation
