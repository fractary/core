# Claude Plugin Framework v3.0

**A Lightweight, MCP-First Architecture for Claude Code Plugins**

Version: 3.0
Date: 2025-12-17
Status: Active

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [Layer Breakdown](#layer-breakdown)
4. [Technology Preference Order](#technology-preference-order)
5. [Component Design](#component-design)
6. [Migration Guide](#migration-guide)
7. [Best Practices](#best-practices)
8. [Anti-Patterns](#anti-patterns)
9. [Examples](#examples)
10. [FAQ](#faq)

---

## Overview

### The Problem With Previous Architectures

**v1.0 - Deep Hierarchy (5+ layers):**
```
Command → Manager Agent → Skill → Handler → Script → CLI
```

Problems:
- 4-5 LLM invocations per operation
- 8-15 seconds latency
- ~3000 tokens per operation
- $0.018-0.020 cost per operation
- Routing decisions at every layer (reliability issues)
- Context pollution in main conversation
- Maintenance nightmare (hundreds of files)

**v2.0 - Skill-Centric (attempted fix):**
```
Command → Agent → Skill → Script → CLI
```

Problems:
- Still 3-4 LLM invocations
- Still routing decisions ("which skill?")
- Skills needed conditional loading because scripts were heavy
- Handlers still needed for platform differences
- Better than v1.0, but still too complex

### The v3.0 Solution: MCP-First Architecture

```
Command (5-10 lines)
  → Dedicated Agent (60-100 lines)
    → MCP Tools / SDK / CLI
      → Business Logic
```

Benefits:
- ✅ 1 LLM invocation (just the agent)
- ✅ 1-2 seconds latency
- ✅ ~500 tokens per operation
- ✅ $0.0005-0.002 cost per operation
- ✅ No routing decisions (hardcoded flow)
- ✅ Isolated context (doesn't pollute main)
- ✅ Auto-triggerable (specific agent descriptions)
- ✅ ~85% less code to maintain

---

## Architecture Principles

### Principle 1: MCP-First Design

**MCP (Model Context Protocol) tools are the primary interface for deterministic operations.**

MCP tools:
- Execute without LLM invocation (no context cost)
- Provide structured input/output
- Are fast and reliable
- Handle all data operations

**Use MCP whenever possible.** Only fall back to SDK or CLI when MCP isn't available.

### Principle 2: Dedicated Agents Over Manager Agents

**Each command gets its own dedicated agent.**

Why?
- ✅ No routing decisions ("which skill should I use?")
- ✅ Focused, small agent definitions (60-100 lines)
- ✅ Specific auto-trigger descriptions with examples
- ✅ Isolated failures (one broken agent doesn't affect others)
- ✅ Parallel development (agents evolve independently)

Manager agents create reliability problems:
- ❌ Must decide which skill/operation to execute
- ❌ Generic descriptions make auto-triggering unreliable
- ❌ Large, complex agent definitions
- ❌ Single point of failure

### Principle 3: Skills Are Obsolete

**With MCP handling heavy lifting, skills add unnecessary complexity.**

Skills were valuable when they:
- Orchestrated multiple scripts (now MCP tools)
- Conditionally loaded sub-workflows (now lightweight, load all)
- Abstracted platform handlers (now SDK handles this)

Now agents can do what skills did:
- Orchestrate MCP tool calls directly
- Handle conditional logic inline (lightweight)
- Remain auto-triggerable
- Stay focused and small (60-100 lines)

**Don't create skills. Put orchestration logic in agents.**

### Principle 4: Platform Abstraction in SDK

**The SDK handles platform-specific logic, not plugins.**

Example: Creating a pull request works differently on GitHub, GitLab, and Bitbucket.

**Before (v2.0):**
```
Skill → Handler-GitHub → gh pr create
Skill → Handler-GitLab → glab mr create
Skill → Handler-Bitbucket → bb pr create
```

**Now (v3.0):**
```
Agent → MCP/SDK → SDK detects platform → Uses correct API
```

The SDK:
- Detects the current platform automatically
- Uses the appropriate API/CLI for that platform
- Provides a unified interface to agents
- Handles platform-specific quirks internally

**Don't create handlers. Extend the SDK.**

### Principle 5: Ultra-Lightweight Commands

**Commands are thin wrappers that invoke agents.**

Commands should:
- Be 5-10 lines of markdown
- Just describe what the command does
- Invoke the dedicated agent
- Not contain logic, parsing, or orchestration

The agent handles everything. The command is just a manual trigger interface.

### Principle 6: Context Efficiency Through Isolation

**Agents run in isolated context, keeping the main conversation clean.**

When an agent is invoked:
- It gets its own context (agent definition + prompt)
- It doesn't pollute the main conversation with intermediate steps
- It returns a clean result to the main context
- Long-running operations don't clutter the user's view

This is especially important for operations that:
- Make many MCP tool calls
- Have complex conditional logic
- Generate verbose output
- Need to track state across multiple steps

### Principle 7: Auto-Trigger Everything

**Both commands AND agents should be auto-triggerable.**

Commands:
- Manual trigger via `/command-name`
- User types it explicitly

Agents:
- Auto-trigger via description matching
- Claude invokes when user describes the task
- More natural, less friction

**Write detailed agent descriptions with examples** to make auto-triggering reliable.

---

## Layer Breakdown

### Layer 1: Commands

**Purpose:** Manual trigger interface for agents

**File Location:** `plugins/{plugin}/commands/{command}.md`

**Size:** 5-10 lines

**Structure:**
```markdown
# /plugin:command-name

Brief description of what this command does.

Invokes the {command-name} agent to handle the operation.
```

**Responsibilities:**
- Describe the command for users
- Invoke the dedicated agent
- Nothing else

**Example:**
```markdown
# /repo:branch-create

Create a Git branch from work items, descriptions, or direct names.

Invokes the branch-create agent to handle branch creation.
```

**What NOT to include:**
- ❌ Argument parsing logic
- ❌ Validation logic
- ❌ Workflow steps
- ❌ MCP tool calls
- ❌ Error handling
- ❌ Output formatting

All of that goes in the agent.

### Layer 2: Dedicated Agents

**Purpose:** Orchestrate operations using MCP/SDK/CLI

**File Location:** `plugins/{plugin}/agents/{command-name}.md`

**Size:** 60-100 lines

**Structure:**
```markdown
# {command-name} Agent

## Description
Detailed description of what this agent does.

## Use Cases
**Use this agent when:**
- User wants to [specific action]
- User mentions "[trigger phrase]"
- User needs to [specific goal]

**Examples:**
- "Example user request 1"
- "Example user request 2"
- "Example user request 3"

## Arguments
List of arguments this agent accepts (from command or natural language)

## Workflow

<WORKFLOW>
1. Parse/extract arguments from command invocation or natural language

2. Conditional logic based on arguments:

   If condition A:
     - Call fractary_plugin_tool_1
     - Process result
     - Call fractary_plugin_tool_2

   If condition B:
     - Call fractary_plugin_tool_3
     - Process result

   If condition C:
     - Call fractary_plugin_tool_4

3. Handle errors:
   - If MCP call fails, return error message
   - If validation fails, return helpful guidance

4. Format and return result
</WORKFLOW>

## Output
Description of what this agent returns
```

**Key Principles:**

1. **Specific Auto-Trigger Description**
   - Include concrete examples of user requests
   - List trigger phrases
   - Be specific about when to use this agent

2. **Hardcoded Flow**
   - No routing decisions
   - Clear, deterministic logic
   - "If X, call tool A. If Y, call tool B."

3. **MCP-First**
   - Prefer MCP tools for all data operations
   - Fall back to SDK via Python only when needed
   - Use CLI only as last resort

4. **Error Handling**
   - Handle MCP tool failures gracefully
   - Provide helpful error messages
   - Don't expose internal errors to users

5. **Isolated Context**
   - Agent runs in its own context
   - Doesn't pollute main conversation
   - Returns clean result

**What NOT to include:**
- ❌ Logic that belongs in the SDK
- ❌ Platform-specific code (use SDK)
- ❌ Script execution (use MCP or SDK)
- ❌ Routing to other agents/skills

### Layer 3: MCP Tools

**Purpose:** Deterministic operations without LLM invocation

**File Location:** `mcp/server/src/handlers/{plugin}.ts`

**Technology:** TypeScript (MCP server)

**Structure:**
```typescript
server.tool({
  name: "fractary_plugin_operation",
  description: "What this tool does",
  parameters: {
    type: "object",
    properties: {
      arg1: { type: "string", description: "..." },
      arg2: { type: "number", description: "..." }
    },
    required: ["arg1"]
  }
}, async ({ arg1, arg2 }) => {
  // Call SDK
  const result = await pluginManager.operation(arg1, arg2);

  // Return structured result
  return {
    content: [{
      type: "text",
      text: JSON.stringify(result, null, 2)
    }]
  };
});
```

**When to create MCP tools:**
- ✅ Deterministic operations (same input → same output)
- ✅ Data retrieval operations
- ✅ CRUD operations
- ✅ Status checks
- ✅ List/search operations

**When NOT to create MCP tools:**
- ❌ Operations requiring reasoning/analysis
- ❌ Operations that need to read user's mind
- ❌ Operations that benefit from LLM interpretation
- ❌ Complex decision-making

**Key Principles:**
1. Thin wrapper around SDK
2. Input validation
3. Structured output (JSON)
4. Clear error messages
5. No business logic (that's in SDK)

### Layer 4: SDK

**Purpose:** Business logic and platform abstraction

**File Location:** `sdk/{language}/src/{plugin}/manager.{ext}`

**Technology:** TypeScript, Python, or other supported language

**Structure:**
```typescript
export class PluginManager {
  private platform: Platform;

  constructor() {
    // Detect platform (GitHub, GitLab, Bitbucket, etc.)
    this.platform = detectPlatform();
  }

  async operation(arg1: string, arg2: number): Promise<Result> {
    // Validate inputs
    this.validate(arg1, arg2);

    // Platform-specific logic
    if (this.platform === 'github') {
      return this.githubOperation(arg1, arg2);
    } else if (this.platform === 'gitlab') {
      return this.gitlabOperation(arg1, arg2);
    }
    // ... etc
  }

  private async githubOperation(arg1: string, arg2: number): Promise<Result> {
    // GitHub-specific implementation
  }

  private async gitlabOperation(arg1: string, arg2: number): Promise<Result> {
    // GitLab-specific implementation
  }
}
```

**Responsibilities:**
- Core business logic
- Platform detection and abstraction
- Input validation
- Data persistence
- External API calls
- Git operations
- File system operations (when needed)

**Key Principles:**
1. Single source of truth for logic
2. Platform abstraction (one interface, multiple implementations)
3. Comprehensive error handling
4. Well-tested
5. Documented

---

## Technology Preference Order

When implementing operations, follow this preference order:

### 1. MCP Tools (Highest Preference)

**Use for:** All deterministic operations

**Why:**
- ✅ No LLM invocation (instant, no cost)
- ✅ No context overhead
- ✅ Structured input/output
- ✅ Easy to test
- ✅ Fast

**Examples:**
- Data retrieval: `fractary_repo_branch_list`
- CRUD operations: `fractary_work_issue_create`
- Status checks: `fractary_repo_status_get`
- Git operations: `fractary_repo_commit`, `fractary_repo_push`

**When available, always use MCP.**

### 2. SDK via Python Script (Second Preference)

**Use for:** Operations MCP can't handle

**Why MCP can't handle:**
- Local file writing/deletion (MCP server might not have filesystem access in some configurations)
- Complex multi-step operations that benefit from local execution
- Operations requiring local state management

**How to use:**
```markdown
## In agent workflow:
1. Write Python script using SDK:
   ```python
   from fractary.sdk import PluginManager

   manager = PluginManager()
   result = manager.operation(args)
   print(result)
   ```

2. Execute via Bash tool:
   python3 script.py

3. Parse output
```

**Examples:**
- Writing local configuration files
- Deleting local cache directories
- Complex local transformations

**Key Principles:**
- Use SDK for business logic, not raw Python
- Keep scripts small and focused
- Clean up temporary scripts after use
- Handle errors gracefully

### 3. CLI via Bash (Lowest Preference)

**Use for:** Operations not available in MCP or SDK

**Why CLI is last resort:**
- ❌ Platform-dependent (sh vs bash vs zsh)
- ❌ Error handling is harder
- ❌ Output parsing is fragile
- ❌ Not cross-platform
- ❌ Harder to test

**When to use:**
- MCP tool doesn't exist yet
- SDK doesn't support the operation
- Need to call external CLI tools (git, gh, glab, etc.)
- Temporary solution while building MCP tool

**Examples:**
```bash
# Git operations not yet in MCP
git checkout -b feature-branch

# GitHub CLI when MCP doesn't cover the case
gh pr view 123 --json comments

# External tools
docker ps | grep my-container
```

**Key Principles:**
- Document why CLI is needed (vs MCP/SDK)
- Plan to migrate to MCP/SDK
- Handle errors explicitly
- Quote paths properly
- Test on multiple platforms

---

## Component Design

### Designing a New Operation

Follow this process when adding a new operation:

#### Step 1: Identify Operation Type

**Deterministic Operation (65% of operations)**
- Same input → same output
- No reasoning required
- Examples: create branch, push commit, list issues

**Path:** Command → Agent → MCP → SDK

**Reasoning Operation (35% of operations)**
- Requires analysis or generation
- Benefits from LLM interpretation
- Examples: generate commit message, review PR, suggest improvements

**Path:** Command → Agent (with reasoning) → MCP (for data) → SDK

#### Step 2: Design SDK Method

Start with the SDK. What should the interface be?

```typescript
// Example: Branch creation
class RepoManager {
  async createBranch(options: {
    name: string;
    base?: string;
    workItemId?: string;
  }): Promise<{
    branch: string;
    created: boolean;
    worktree?: string;
  }> {
    // Implementation
  }
}
```

**SDK Design Principles:**
- Clear, typed interfaces
- Platform-agnostic
- Comprehensive error handling
- Well-documented
- Testable

#### Step 3: Create MCP Tool

Wrap the SDK method in an MCP tool:

```typescript
server.tool({
  name: "fractary_repo_branch_create",
  description: "Create a new Git branch",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Branch name" },
      base: { type: "string", description: "Base branch (default: main)" },
      work_item_id: { type: "string", description: "Work item ID" }
    },
    required: ["name"]
  }
}, async ({ name, base, work_item_id }) => {
  const manager = new RepoManager();
  const result = await manager.createBranch({
    name,
    base,
    workItemId: work_item_id
  });

  return {
    content: [{
      type: "text",
      text: JSON.stringify(result, null, 2)
    }]
  };
});
```

#### Step 4: Create Dedicated Agent

```markdown
# branch-create Agent

Create Git branches from work items, descriptions, or direct names.

**Use this agent when:**
- User wants to create a new Git branch
- User mentions "create branch", "new branch", "make a branch"
- User references a work item and wants a branch for it

**Examples:**
- "Create a branch for issue 123"
- "Make a feature branch called dark-mode"
- "Create a branch for the authentication work"

## Workflow

<WORKFLOW>
1. Extract arguments:
   - name (direct branch name)
   - work_item_id (issue/ticket number)
   - description (semantic name from description)
   - base (base branch, default: main)
   - worktree (create worktree, default: false)

2. Determine branch creation path:

   If work_item_id provided:
     - Call: fractary_work_issue_fetch (get issue details)
     - Call: fractary_repo_branch_name_generate (generate semantic name)
     - Call: fractary_repo_branch_create (create branch)

   If description provided (no work_item_id):
     - Call: fractary_repo_branch_name_generate (generate semantic name)
     - Call: fractary_repo_branch_create (create branch)

   If name provided directly:
     - Call: fractary_repo_branch_create (create branch with exact name)

3. If worktree requested:
   - Call: fractary_repo_worktree_create (create worktree for branch)

4. Return result:
   - Branch name
   - Location (main repo or worktree path)
   - Success message
</WORKFLOW>
```

#### Step 5: Create Ultra-Lightweight Command

```markdown
# /repo:branch-create

Create a Git branch from work items, descriptions, or direct names.

Invokes the branch-create agent to handle branch creation.
```

### Operation Flow Summary

```
User: "/repo:branch-create --work-id 123"
  ↓
Command: Invoke branch-create agent
  ↓
Agent (isolated context):
  1. Extract work_item_id = 123
  2. Call fractary_work_issue_fetch(123)
     → Gets issue: "Add dark mode toggle"
  3. Call fractary_repo_branch_name_generate(work_id=123, title="Add dark mode toggle")
     → Gets name: "feature/123-add-dark-mode-toggle"
  4. Call fractary_repo_branch_create(name="feature/123-add-dark-mode-toggle")
     → Creates branch
  5. Return: "✅ Created branch 'feature/123-add-dark-mode-toggle'"
  ↓
Main Context: "✅ Created branch 'feature/123-add-dark-mode-toggle'"
```

**Key points:**
- Agent runs in isolated context
- Main context only sees the final result
- No context pollution from intermediate steps
- Fast (1-2 seconds for whole operation)

---

## Migration Guide

### Migrating from v2.0 (Skill-Based) to v3.0

#### Step 1: Audit Current Architecture

Identify what you have:
- [ ] Commands
- [ ] Manager agent(s)
- [ ] Skills
- [ ] Handlers
- [ ] Scripts

#### Step 2: Archive Old Components

Don't delete - archive for reference:

```bash
mkdir -p plugins/{plugin}/archived
mv plugins/{plugin}/skills plugins/{plugin}/archived/
mv plugins/{plugin}/scripts plugins/{plugin}/archived/
mv plugins/{plugin}/handlers plugins/{plugin}/archived/
```

Create `plugins/{plugin}/archived/README.md` explaining what was archived and why.

#### Step 3: Ensure MCP Tools Exist

For each operation, verify MCP tool exists in `mcp/server/src/handlers/{plugin}.ts`.

If not, create it:
1. Design SDK method first
2. Implement SDK method
3. Wrap in MCP tool
4. Test MCP tool

#### Step 4: Create Dedicated Agents

For each command, create a dedicated agent:

**Template:**
```markdown
# {operation-name} Agent

[Description of what this agent does]

**Use this agent when:**
- [Trigger pattern 1]
- [Trigger pattern 2]
- [Trigger pattern 3]

**Examples:**
- "[Example user request 1]"
- "[Example user request 2]"
- "[Example user request 3]"

## Workflow

<WORKFLOW>
1. Extract arguments from command or natural language

2. [Conditional logic]:

   If [condition A]:
     - Call: fractary_{plugin}_{tool_1}
     - Process result
     - Call: fractary_{plugin}_{tool_2}

   If [condition B]:
     - Call: fractary_{plugin}_{tool_3}

3. Handle errors and return result
</WORKFLOW>
```

**Migration checklist per agent:**
- [ ] Identify what the old skill did
- [ ] List all MCP tools needed
- [ ] Write conditional logic for different paths
- [ ] Add specific auto-trigger examples
- [ ] Test auto-triggering
- [ ] Test command invocation

#### Step 5: Simplify Commands

Replace complex commands with ultra-lightweight versions:

**Before (v2.0):**
```markdown
# /repo:branch-create

[100+ lines of argument parsing, validation, workflow logic, error handling, etc.]
```

**After (v3.0):**
```markdown
# /repo:branch-create

Create a Git branch from work items, descriptions, or direct names.

Invokes the branch-create agent to handle branch creation.
```

#### Step 6: Remove Manager Agent

If you have a manager agent that routes to skills:
1. Delete it
2. Each command now invokes its dedicated agent directly
3. No routing needed

#### Step 7: Update Documentation

- [ ] Update plugin README.md
- [ ] Document new architecture
- [ ] Update command documentation
- [ ] Add examples of auto-triggering

#### Step 8: Test

**Test each operation:**
1. **Command invocation:** `/plugin:command args`
2. **Auto-trigger:** Natural language request in main context
3. **Error handling:** Invalid inputs, MCP failures
4. **Edge cases:** Empty inputs, special characters, etc.

**Integration tests:**
1. Common workflows end-to-end
2. Cross-plugin operations
3. Platform-specific scenarios (GitHub, GitLab, etc.)

#### Step 9: Commit and Document

Commit in logical chunks:
1. Archive old components
2. Create MCP tools (if new)
3. Create dedicated agents (batch by similarity)
4. Simplify commands (batch by similarity)
5. Remove manager agent
6. Update documentation

Use conventional commits:
```bash
git commit -m "chore(plugin): archive skills and scripts (v3.0 migration)"
git commit -m "feat(plugin): add MCP tools for operations"
git commit -m "refactor(plugin): create dedicated agents (v3.0)"
git commit -m "refactor(plugin): simplify commands to invoke agents"
git commit -m "refactor(plugin): remove manager agent (routing obsolete)"
git commit -m "docs(plugin): update for v3.0 architecture"
```

---

## Best Practices

### 1. Agent Design

**DO:**
- ✅ Write specific, detailed descriptions with examples
- ✅ Include common trigger phrases users might say
- ✅ Use clear, deterministic conditional logic
- ✅ Call MCP tools for all data operations
- ✅ Handle errors gracefully with helpful messages
- ✅ Keep agents focused on one operation
- ✅ Return structured, user-friendly results

**DON'T:**
- ❌ Create manager agents that route to other components
- ❌ Put business logic in agents (that's SDK's job)
- ❌ Use vague descriptions like "handles repo operations"
- ❌ Make routing decisions ("which skill should I use?")
- ❌ Pollute main context with verbose output
- ❌ Handle platform differences (SDK does this)

### 2. MCP Tool Design

**DO:**
- ✅ Make tools focused and atomic
- ✅ Use clear, descriptive names: `fractary_plugin_operation`
- ✅ Validate inputs thoroughly
- ✅ Return structured JSON
- ✅ Provide helpful error messages
- ✅ Keep tools thin (wrapper around SDK)
- ✅ Document parameters clearly

**DON'T:**
- ❌ Put business logic in MCP tools
- ❌ Make tools do too much (one responsibility)
- ❌ Return unstructured text (use JSON)
- ❌ Expose internal errors to users
- ❌ Duplicate SDK code in tools

### 3. SDK Design

**DO:**
- ✅ Put all business logic here
- ✅ Abstract platform differences
- ✅ Provide typed interfaces
- ✅ Write comprehensive tests
- ✅ Document public APIs
- ✅ Handle edge cases
- ✅ Validate inputs

**DON'T:**
- ❌ Leak platform-specific details
- ❌ Assume a single platform
- ❌ Skip error handling
- ❌ Use unclear variable/method names
- ❌ Write untested code

### 4. Command Design

**DO:**
- ✅ Keep commands ultra-lightweight (5-10 lines)
- ✅ Just describe and invoke agent
- ✅ Use clear, intuitive command names
- ✅ Document what the command does (briefly)

**DON'T:**
- ❌ Put any logic in commands
- ❌ Parse arguments in commands
- ❌ Validate inputs in commands
- ❌ Call MCP tools from commands
- ❌ Include workflows in commands

### 5. Context Efficiency

**DO:**
- ✅ Use agents for isolation (keeps main context clean)
- ✅ Return concise results to main context
- ✅ Load only what's needed in each layer
- ✅ Use MCP tools (no context cost)

**DON'T:**
- ❌ Run operations in main context that could be isolated
- ❌ Return verbose MCP tool output to main context
- ❌ Load unnecessary files or data
- ❌ Create skills with conditional loading (obsolete pattern)

### 6. Auto-Triggering

**DO:**
- ✅ Write specific agent descriptions
- ✅ Include multiple trigger phrase examples
- ✅ Test auto-triggering with natural language
- ✅ Document common user requests
- ✅ Use action-oriented descriptions

**DON'T:**
- ❌ Write vague descriptions
- ❌ Assume users will use commands
- ❌ Skip testing auto-trigger scenarios
- ❌ Use technical jargon in descriptions

---

## Anti-Patterns

### ❌ Anti-Pattern 1: Manager Agent with Routing

**What it looks like:**
```markdown
# plugin-manager Agent

Routes plugin operations to appropriate skills.

<WORKFLOW>
If operation === "branch-create":
  Invoke branch-create skill
If operation === "commit":
  Invoke commit skill
...
</WORKFLOW>
```

**Why it's bad:**
- Routing decision is unreliable ("which skill?")
- Generic description makes auto-triggering poor
- Single point of failure
- Large, complex agent file

**What to do instead:**
Create dedicated agents. Each command invokes its specific agent.

### ❌ Anti-Pattern 2: Skills for Orchestration

**What it looks like:**
```markdown
# branch-create Skill

Orchestrates branch creation using MCP tools.

<WORKFLOW>
1. Call MCP tool A
2. Call MCP tool B
3. Call MCP tool C
</WORKFLOW>
```

**Why it's bad:**
- Unnecessary layer (agent can call MCP directly)
- More files to maintain
- No context efficiency benefit with MCP
- Routing decision needed ("which skill?")

**What to do instead:**
Put orchestration logic in the dedicated agent.

### ❌ Anti-Pattern 3: Handlers for Platform Differences

**What it looks like:**
```
Skill → Handler-GitHub → GitHub-specific logic
Skill → Handler-GitLab → GitLab-specific logic
```

**Why it's bad:**
- Platform logic should be in SDK
- Creates maintenance burden
- Harder to test
- Not reusable outside plugin

**What to do instead:**
Put platform abstraction in SDK. Agent calls SDK, SDK handles platform.

### ❌ Anti-Pattern 4: Scripts Instead of SDK

**What it looks like:**
```bash
# scripts/create-branch.sh
#!/bin/bash
git checkout -b "$1"
```

**Why it's bad:**
- Not cross-platform
- Not testable
- Not reusable
- Error handling is harder
- Can't use in non-Bash contexts

**What to do instead:**
Implement in SDK, expose via MCP tool.

### ❌ Anti-Pattern 5: Business Logic in Agents

**What it looks like:**
```markdown
# Agent workflow
1. Extract work item ID
2. Parse work item type (bug, feature, chore)
3. Generate branch prefix based on type
4. Validate branch name against conventions
5. Check if branch already exists
6. Create branch with git checkout
```

**Why it's bad:**
- Agent has too much logic
- Logic not reusable
- Hard to test
- Harder to maintain

**What to do instead:**
Put logic in SDK. Agent just orchestrates MCP calls.

### ❌ Anti-Pattern 6: Complex Commands

**What it looks like:**
```markdown
# /plugin:command

[100+ lines of parsing, validation, workflow, error handling]

<WORKFLOW>
1. Parse these arguments...
2. Validate these rules...
3. Call this skill...
4. Handle these errors...
</WORKFLOW>
```

**Why it's bad:**
- Commands should be lightweight
- Logic belongs in agent
- Hard to maintain
- Not reusable

**What to do instead:**
```markdown
# /plugin:command

Brief description.

Invokes the {command} agent.
```

### ❌ Anti-Pattern 7: CLI as First Choice

**What it looks like:**
```markdown
# Agent workflow
1. Execute: git status --porcelain
2. Parse output
3. Execute: git add .
4. Execute: git commit -m "message"
5. Execute: git push origin branch
```

**Why it's bad:**
- CLI should be last resort
- MCP tools are faster and more reliable
- Output parsing is fragile
- Not cross-platform

**What to do instead:**
```markdown
# Agent workflow
1. Call: fractary_repo_status
2. Call: fractary_repo_commit
3. Call: fractary_repo_push
```

---

## Examples

### Example 1: Simple Deterministic Operation

**Operation:** List Git branches

**SDK:**
```typescript
class RepoManager {
  async listBranches(options?: {
    stale?: boolean;
    merged?: boolean;
    pattern?: string;
  }): Promise<Branch[]> {
    // Implementation
  }
}
```

**MCP Tool:**
```typescript
server.tool({
  name: "fractary_repo_branch_list",
  description: "List Git branches with optional filters",
  parameters: {
    type: "object",
    properties: {
      stale: { type: "boolean", description: "Show only stale branches" },
      merged: { type: "boolean", description: "Show only merged branches" },
      pattern: { type: "string", description: "Filter by pattern (glob)" }
    }
  }
}, async ({ stale, merged, pattern }) => {
  const manager = new RepoManager();
  const branches = await manager.listBranches({ stale, merged, pattern });

  return {
    content: [{
      type: "text",
      text: JSON.stringify(branches, null, 2)
    }]
  };
});
```

**Agent:**
```markdown
# branch-list Agent

List Git branches with optional filtering.

**Use this agent when:**
- User wants to see Git branches
- User asks "what branches exist?"
- User needs to find a specific branch

**Examples:**
- "Show me all branches"
- "List stale branches"
- "Find branches matching 'feature/*'"

## Workflow

<WORKFLOW>
1. Extract filter criteria:
   - stale (boolean)
   - merged (boolean)
   - pattern (string)

2. Call: fractary_repo_branch_list with filters

3. Format results:
   - List branch names
   - Show status (active/stale, merged/unmerged)
   - Highlight current branch

4. Return formatted list
</WORKFLOW>
```

**Command:**
```markdown
# /repo:branch-list

List Git branches with optional filters.

Invokes the branch-list agent.
```

### Example 2: Complex Orchestration Operation

**Operation:** Create branch from work item

**SDK:**
```typescript
class RepoManager {
  async createBranch(options: {
    name: string;
    base?: string;
  }): Promise<BranchResult> { /* ... */ }

  async generateBranchName(options: {
    workItemId?: string;
    description?: string;
    type?: string;
  }): Promise<string> { /* ... */ }
}

class WorkManager {
  async fetchIssue(id: string): Promise<Issue> { /* ... */ }
}
```

**MCP Tools:**
```typescript
// In work handler
server.tool({
  name: "fractary_work_issue_fetch",
  description: "Fetch issue/ticket details",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Issue ID" }
    },
    required: ["id"]
  }
}, async ({ id }) => {
  const manager = new WorkManager();
  const issue = await manager.fetchIssue(id);
  return {
    content: [{ type: "text", text: JSON.stringify(issue, null, 2) }]
  };
});

// In repo handler
server.tool({
  name: "fractary_repo_branch_name_generate",
  description: "Generate semantic branch name",
  parameters: {
    type: "object",
    properties: {
      work_item_id: { type: "string" },
      description: { type: "string" },
      type: { type: "string", enum: ["feature", "bugfix", "hotfix", "chore"] }
    }
  }
}, async ({ work_item_id, description, type }) => {
  const manager = new RepoManager();
  const name = await manager.generateBranchName({
    workItemId: work_item_id,
    description,
    type
  });
  return {
    content: [{ type: "text", text: name }]
  };
});

server.tool({
  name: "fractary_repo_branch_create",
  description: "Create a new Git branch",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Branch name" },
      base: { type: "string", description: "Base branch" }
    },
    required: ["name"]
  }
}, async ({ name, base }) => {
  const manager = new RepoManager();
  const result = await manager.createBranch({ name, base });
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
  };
});
```

**Agent:**
```markdown
# branch-create Agent

Create Git branches from work items, descriptions, or direct names.

**Use this agent when:**
- User wants to create a new Git branch
- User mentions "create branch", "new branch", "make a branch"
- User references a work item and wants a branch for it

**Examples:**
- "Create a branch for issue 123"
- "Make a feature branch called dark-mode"
- "Create a branch for the authentication work"
- "New branch from ticket ABC-456"

## Workflow

<WORKFLOW>
1. Extract arguments:
   - work_item_id (issue/ticket number)
   - name (direct branch name)
   - description (for semantic name generation)
   - base (base branch, default: main)
   - type (feature/bugfix/hotfix/chore)

2. Determine creation path:

   **Path A: From Work Item**
   If work_item_id provided:
     1. Call: fractary_work_issue_fetch(work_item_id)
        → Get issue details (title, type, labels)
     2. Call: fractary_repo_branch_name_generate(work_item_id, issue.title, issue.type)
        → Generate semantic name (e.g., "feature/123-add-dark-mode")
     3. Call: fractary_repo_branch_create(name, base)
        → Create branch

   **Path B: From Description**
   If description provided (no work_item_id):
     1. Call: fractary_repo_branch_name_generate(description, type)
        → Generate semantic name (e.g., "feature/add-dark-mode")
     2. Call: fractary_repo_branch_create(name, base)
        → Create branch

   **Path C: Direct Name**
   If name provided directly:
     1. Call: fractary_repo_branch_create(name, base)
        → Create branch with exact name

3. Handle errors:
   - If work item not found: "Issue {id} not found. Please check the ID."
   - If branch exists: "Branch '{name}' already exists. Use a different name."
   - If git error: "Failed to create branch: {error}"

4. Return result:
   "✅ Created branch '{name}' from '{base}'"

   Include:
   - Branch name
   - Base branch
   - Next steps (e.g., "Switch to it with: git checkout {name}")
</WORKFLOW>
```

**Command:**
```markdown
# /repo:branch-create

Create a Git branch from work items, descriptions, or direct names.

Invokes the branch-create agent to handle branch creation.
```

### Example 3: Reasoning Operation

**Operation:** Generate commit message from changes

**SDK:**
```typescript
class RepoManager {
  async getStatus(): Promise<Status> { /* ... */ }
  async getDiff(staged: boolean): Promise<string> { /* ... */ }
}
```

**MCP Tools:**
```typescript
server.tool({
  name: "fractary_repo_status",
  description: "Get Git repository status",
  parameters: { type: "object", properties: {} }
}, async () => {
  const manager = new RepoManager();
  const status = await manager.getStatus();
  return {
    content: [{ type: "text", text: JSON.stringify(status, null, 2) }]
  };
});

server.tool({
  name: "fractary_repo_diff",
  description: "Get Git diff",
  parameters: {
    type: "object",
    properties: {
      staged: { type: "boolean", description: "Show staged changes only" }
    }
  }
}, async ({ staged = true }) => {
  const manager = new RepoManager();
  const diff = await manager.getDiff(staged);
  return {
    content: [{ type: "text", text: diff }]
  };
});
```

**Agent:**
```markdown
# commit-message-generate Agent

Analyze staged changes and generate semantic commit messages following conventional commit format.

**Use this agent when:**
- User wants to commit but hasn't written a message
- User asks "generate a commit message"
- User invokes /repo:commit without a message

**Examples:**
- "Generate a commit message for my changes"
- "What should my commit message be?"
- "Create a commit with an appropriate message"

## Workflow

<WORKFLOW>
1. Fetch current changes:
   - Call: fractary_repo_status
     → Get list of changed files
   - Call: fractary_repo_diff(staged: true)
     → Get actual code changes

2. Analyze changes (AI reasoning):
   - Examine which files changed
   - Review the actual code diff
   - Identify patterns:
     - New files → "feat" or "chore"
     - Bug fixes → "fix"
     - Documentation → "docs"
     - Tests → "test"
     - Refactoring → "refactor"
   - Determine scope (which part of codebase)
   - Assess if breaking change

3. Generate commit message:
   Format: <type>(<scope>): <description>

   Example:
   ```
   feat(auth): add password reset functionality

   - Add reset password endpoint
   - Implement email token verification
   - Add rate limiting for reset requests
   ```

   Guidelines:
   - Type: feat, fix, docs, style, refactor, test, chore
   - Scope: part of codebase affected
   - Description: imperative mood, lowercase, no period
   - Body: bullet points for multiple changes

4. Return commit message:
   - Formatted according to conventional commits
   - Explains the "why" not just the "what"
   - Includes relevant context
   - Suggests whether to include breaking change marker
</WORKFLOW>

## Notes

This agent does NOT create the commit - it only generates the message.
The user or another agent will use this message with fractary_repo_commit.
```

**Command:**
```markdown
# /repo:commit-message-generate

Generate a semantic commit message from staged changes.

Invokes the commit-message-generate agent to analyze changes and create an appropriate message.
```

---

## FAQ

### Q: When should I use an agent vs direct MCP call?

**A:** Always use an agent from commands. Agents provide:
- Isolated context (no main pollution)
- Auto-trigger capability
- Error handling
- User-friendly output

Even if the agent just calls one MCP tool, wrap it in an agent for consistency and future extensibility.

### Q: Can agents call other agents?

**A:** Yes! Agents can invoke other agents using the Task tool. This is useful for:
- Reusing complex reasoning (e.g., commit-message-generate agent)
- Breaking down large operations
- Sharing functionality

Example:
```markdown
# pr-create Agent workflow

1. Call commit-message-generate agent
2. Use generated message for PR title/body
3. Call fractary_repo_pr_create
```

### Q: Should I ever create skills?

**A:** In v3.0, skills are rarely needed. Put orchestration logic in agents instead.

Only create skills if:
- You have a very specific shared utility used by multiple agents
- The utility is purely deterministic (no reasoning)
- It can't be an MCP tool

Even then, consider if it should just be another agent that other agents can call.

### Q: What if MCP doesn't support my operation?

**A:** Follow the preference order:

1. **Can it be added to MCP?** → Add it to MCP server
2. **Does it require local file access?** → Use SDK via Python script
3. **Is it a one-off CLI call?** → Use Bash tool (document as temporary)

Always prefer MCP. Fallbacks are temporary until MCP support is added.

### Q: How do I handle platform differences (GitHub/GitLab/Bitbucket)?

**A:** In the SDK! Not in agents, not in MCP tools.

```typescript
// SDK handles platform detection
class RepoManager {
  async createPR(options: PROptions): Promise<PR> {
    if (this.platform === 'github') {
      return this.createGitHubPR(options);
    } else if (this.platform === 'gitlab') {
      return this.createGitLabMR(options);
    }
    // etc.
  }
}
```

The agent just calls one MCP tool, the SDK figures out the platform.

### Q: How do I test agents?

**A:**

1. **Auto-trigger tests:** Try natural language requests
   ```
   User: "Create a branch for issue 123"
   Expected: Agent auto-triggers and creates branch
   ```

2. **Command tests:** Invoke via command
   ```
   User: /repo:branch-create --work-id 123
   Expected: Agent executes successfully
   ```

3. **Error handling tests:** Invalid inputs
   ```
   User: /repo:branch-create --work-id 999999
   Expected: Graceful error message
   ```

4. **Integration tests:** Full workflows
   ```
   User: "Create a branch for issue 123, commit my changes, and create a PR"
   Expected: Multiple agents coordinate successfully
   ```

### Q: Should agents have a claude.md file?

**A:** No, skip it. Be deliberate about what context each agent needs.

Instead of loading a generic claude.md for all agents:
- Keep agents self-contained (everything in the agent .md file)
- Pass specific context via the prompt parameter
- Use a "prime command" if you need to load project-specific context

### Q: How long should agent descriptions be?

**A:** As long as needed to make auto-triggering reliable!

Agent descriptions can be much longer than skill descriptions. Include:
- Detailed explanation of what it does
- Multiple trigger phrases
- Concrete examples of user requests
- Common variations

Example:
```markdown
# branch-create Agent

Create Git branches from work items, descriptions, or direct names.

This agent handles all branch creation scenarios:
- Creating from work item IDs (issues, tickets)
- Generating semantic names from descriptions
- Creating with direct branch names
- Optionally creating worktrees

**Use this agent when:**
- User wants to create a new Git branch
- User mentions "create branch", "new branch", "make a branch"
- User references a work item and wants a branch for it
- User wants a worktree for parallel development

**Examples:**
- "Create a branch for issue 123"
- "Make a feature branch called dark-mode"
- "Create a branch for the authentication work"
- "New branch from ticket ABC-456"
- "Create a branch with worktree for issue 789"
```

This helps Claude Code match user requests to the right agent.

### Q: What about backward compatibility?

**A:** v3.0 is a breaking change architecture. Don't maintain backward compatibility.

Instead:
- Archive old components (for reference)
- Migrate all at once (single release)
- Update documentation
- Provide migration guide for users

Trying to support both architectures creates complexity that defeats the purpose.

### Q: How do I organize files?

**A:** Recommended structure:

```
plugins/{plugin}/
├── commands/
│   ├── command-1.md
│   ├── command-2.md
│   └── ...
├── agents/
│   ├── command-1.md (same name as command)
│   ├── command-2.md
│   └── ...
├── archived/ (v2.0 components)
│   ├── README.md (explains what and why)
│   ├── skills/
│   ├── scripts/
│   └── handlers/
├── config/
├── docs/
└── README.md

mcp/server/src/handlers/
├── plugin-1.ts (all MCP tools for plugin-1)
├── plugin-2.ts (all MCP tools for plugin-2)
└── ...

sdk/{language}/src/
├── plugin-1/
│   ├── manager.ts (main SDK class)
│   ├── types.ts
│   └── utils.ts
├── plugin-2/
│   └── ...
└── ...
```

### Q: Can I use this architecture for non-plugin code?

**A:** Yes! This architecture works for any Claude Code project:

- Replace "command" with your entry point
- Create dedicated agents for each operation
- Use MCP tools for deterministic operations
- Put business logic in reusable SDK/library code
- Use CLI only as last resort

The principles apply broadly:
- Isolated context via agents
- MCP-first design
- Ultra-lightweight entry points
- Focused, auto-triggerable agents

---

## Conclusion

The v3.0 architecture prioritizes:

1. **Simplicity** - Fewer layers, less complexity
2. **Performance** - MCP tools are fast and free
3. **Reliability** - No routing decisions, deterministic flow
4. **Maintainability** - Small, focused files
5. **User Experience** - Auto-triggering, isolated context
6. **Cost Efficiency** - Minimal LLM invocations

By following this framework, you'll create Claude Code plugins that are:
- Fast (1-2 seconds vs 8-15 seconds)
- Cheap (~$0.001 vs ~$0.018 per operation)
- Reliable (no routing decisions)
- Maintainable (85% less code)
- User-friendly (auto-triggering, clean output)

**Start with MCP, use dedicated agents, keep it simple.**

---

## Additional Resources

- [MCP Server Development Guide](../mcp/README.md)
- [SDK Development Guide](../../sdk/README.md)
- [Plugin Development Guide](../plugins/README.md)
- [Architecture Decision Records](../architecture/)
- [Migration Examples](../examples/v3-migrations/)

---

**Questions or feedback?** Open an issue in the repository or consult the team.

**Ready to migrate?** Follow the [Migration Guide](#migration-guide) section above.

**Building something new?** Start with the [Component Design](#component-design) section.
