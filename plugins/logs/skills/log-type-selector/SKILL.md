---
name: fractary-log-type-selector
description: Helps select the right log type. Use when creating logs without a specific type indicated.
model: claude-haiku-4-5
---

<CONTEXT>
You help users select the appropriate log type when they want to create a log entry
but haven't specified which type to use. You guide them through a decision process to
identify the best log type for their needs.
</CONTEXT>

<WHEN_TO_USE>
Use this skill when:
- User wants to create a log but doesn't specify a type
- User is unsure which log type to use
- User's request doesn't clearly match a specific type
- User explicitly asks for help choosing a log type

Common triggers:
- "Create a log..."
- "I need to log..."
- "What type of log should I create?"
- "Help me choose a log type..."
- "Log this..." (without specific type)
</WHEN_TO_USE>

<CLI_COMMANDS>
## List All Available Log Types
```bash
fractary-core logs types --json
```
Returns array of available types with id, display_name, description, output_path.

## Get Detailed Type Information
```bash
fractary-core logs type-info <type> --json
```
Returns full type definition including frontmatter requirements, structure, status values, and retention policy.

## Create Log Entry
```bash
fractary-core logs write --type <type> --title "<title>" --content "<content>" [--issue <number>] [--json]
```
</CLI_COMMANDS>

<WORKFLOW>
1. Run `fractary-core logs types --json` to get current available types
2. Parse JSON response to build type options list
3. Analyze the user's request for type indicators
4. If type is clear from context → recommend that type
5. If unclear → ask clarifying questions using the type list
6. Once type is determined → provide the CLI command to create the log
7. If truly ambiguous → suggest 2-3 most likely options and let user choose
</WORKFLOW>

<DECISION_TREE>

**Is it a Claude Code or AI conversation?**
→ Use **session** (Session Log)
  - Conversation tracking, token usage, AI interaction history

**Is it a build, compilation, or CI/CD output?**
→ Use **build** (Build Log)
  - npm/cargo/make builds, CI output, compilation results

**Is it a deployment or release to an environment?**
→ Use **deployment** (Deployment Log)
  - Production deploys, staging releases, rollbacks

**Is it debugging, troubleshooting, or error investigation?**
→ Use **debug** (Debug Log)
  - Bug investigation, error analysis, troubleshooting sessions

**Is it a security, compliance, or access event?**
→ Use **audit** (Audit Log)
  - Security events, access logs, compliance tracking

**Is it test execution or QA results?**
→ Use **test** (Test Log)
  - Test runs, coverage reports, QA results

**Is it a multi-step workflow or pipeline execution?**
→ Use **workflow** (Workflow Log)
  - FABER phases, ETL pipelines, automation workflows

**Is it a system event, alert, or incident?**
→ Use **operational** (Operational Log)
  - Service health, monitoring alerts, infrastructure events

**Is it tracking a version change or update?**
→ Use **changelog** (Changelog Log)
  - Version changes, feature updates, release notes

</DECISION_TREE>

<TYPE_SUMMARY_TABLE>

| Type | Use When | Examples |
|------|----------|----------|
| **session** | AI/Claude conversation | Session transcripts, token tracking |
| **build** | Compilation/CI output | npm install, cargo build, CI runs |
| **deployment** | Releasing to environment | Deploy to prod, staging release |
| **debug** | Troubleshooting | Bug investigation, error analysis |
| **audit** | Security/compliance | Access logs, security events |
| **test** | Test execution | pytest run, jest results, coverage |
| **workflow** | Multi-step processes | FABER phases, ETL pipelines |
| **operational** | System events | Alerts, incidents, health checks |
| **changelog** | Version tracking | Feature updates, breaking changes |

</TYPE_SUMMARY_TABLE>

<CLARIFYING_QUESTIONS>
When the intent is unclear, ask one of these:

1. **Activity-focused**: "What activity produced this log?
   (a) Build/compilation, (b) Deployment/release, (c) Testing, (d) Debugging"

2. **Audience-focused**: "Who will read this log?
   (a) Developers, (b) Operations team, (c) Auditors/compliance, (d) Everyone"

3. **Duration-focused**: "Is this log for:
   (a) A single event, (b) An ongoing session, (c) A multi-step process"
</CLARIFYING_QUESTIONS>

<EXAMPLES>

**Example 1**: User says "Log this for issue #123"
→ Ambiguous - could be session, debug, or workflow
→ Ask: "What type of activity? A debugging session, a workflow execution, or something else?"

**Example 2**: User says "Save the test output"
→ Clear match → test
→ Recommend: "This sounds like test execution results. I'll use the test log type."
→ Run: `fractary-core logs write --type test --title "Test Output" --content "..." --json`

**Example 3**: User says "Log what I did today"
→ Likely session log
→ Ask: "Are you logging a Claude Code session, or a different type of activity?"

</EXAMPLES>

<DYNAMIC_TYPE_DISCOVERY>
IMPORTANT: The list of log types is dynamic and may include custom types.
Always run `fractary-core logs types --json` to get the current list of available types.
Do not rely solely on the hardcoded decision tree - check for custom types that may
better match the user's needs.

Custom types appear when:
- Project has `.fractary/logs/templates/manifest.yaml`
- logs.custom_templates_path is set in config
</DYNAMIC_TYPE_DISCOVERY>
