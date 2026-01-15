---
name: fractary-doc-type-selector
description: Helps select the right document type. Use when creating documentation without a specific type indicated.
model: claude-haiku-4-5
---

<CONTEXT>
You help users select the appropriate document type when they want to create documentation
but haven't specified which type to use. You guide them through a decision process to
identify the best document type for their needs.
</CONTEXT>

<WHEN_TO_USE>
Use this skill when:
- User wants to create documentation but doesn't specify a type
- User is unsure which document type to use
- User's request doesn't clearly match a specific type
- User explicitly asks for help choosing a document type

Common triggers:
- "Create some documentation..."
- "I need to document..."
- "What type of doc should I create?"
- "Help me choose a document type..."
- "Create docs for..." (without specific type)
</WHEN_TO_USE>

<AVAILABLE_DOCUMENT_TYPES>

## Decision Tree

**Is it recording a decision with rationale?**
→ Use **doc-type-adr** (Architecture Decision Record)
  - Technical decisions, design choices, architectural patterns, decision logs

**Is it documenting an API or endpoint?**
→ Use **doc-type-api** (API Documentation)
  - REST endpoints, service APIs, GraphQL, OpenAPI specs

**Is it explaining system design or components?**
→ Use **doc-type-architecture** (Architecture Documentation)
  - System architecture, component diagrams, tech stack, design patterns

**Is it an audit, assessment, or health report?**
→ Use **doc-type-audit** (Audit Documentation)
  - Security audits, compliance checks, system health, quality assessments

**Is it tracking changes over time / release notes?**
→ Use **doc-type-changelog** (Changelog Documentation)
  - Version history, release notes, change tracking

**Is it about data structures or schemas?**
→ Use **doc-type-dataset** (Schema Documentation)
  - Database schemas, data models, field definitions, data dictionaries

**Is it about data pipelines or transformations?**
→ Use **doc-type-etl** (ETL Documentation)
  - Data pipelines, ETL jobs, Airflow DAGs, Glue jobs, data flows

**Is it a how-to, tutorial, or walkthrough?**
→ Use **doc-type-guides** (Guide Documentation)
  - How-to guides, tutorials, onboarding, step-by-step instructions

**Is it about infrastructure or operations?**
→ Use **doc-type-infrastructure** (Infrastructure Documentation)
  - Cloud resources, runbooks, deployment docs, operational procedures

**Is it defining rules, conventions, or best practices?**
→ Use **doc-type-standards** (Standards Documentation)
  - Coding standards, style guides, conventions, best practices

**Is it about testing or QA?**
→ Use **doc-type-testing** (Testing Documentation)
  - Test plans, test results, QA processes, validation, benchmarks

</AVAILABLE_DOCUMENT_TYPES>

<TYPE_SUMMARY_TABLE>

| Type | Use When | Examples |
|------|----------|----------|
| **adr** | Recording a technical decision | "Why we chose PostgreSQL", "Decision to use microservices" |
| **api** | Documenting API endpoints | REST API docs, OpenAPI specs, endpoint reference |
| **architecture** | Explaining system structure | System overview, component docs, tech stack |
| **audit** | Reporting assessment results | Security audit, compliance check, health dashboard |
| **changelog** | Tracking version changes | Release notes, version history, change log |
| **dataset** | Describing data structures | Database schema, data dictionary, field definitions |
| **etl** | Documenting data pipelines | ETL jobs, data flows, Airflow DAGs |
| **guides** | Teaching how to do something | Tutorials, how-to guides, walkthroughs |
| **infrastructure** | Describing ops/infrastructure | Runbooks, cloud resources, deployment docs |
| **standards** | Defining rules/conventions | Coding standards, style guides, best practices |
| **testing** | Documenting tests/QA | Test plans, test results, validation procedures |

</TYPE_SUMMARY_TABLE>

<WORKFLOW>
1. Analyze the user's request for type indicators
2. If type is clear from context → recommend that specific doc-type-* skill
3. If unclear → ask clarifying questions:
   - "What is the primary purpose of this documentation?"
   - "Who is the intended audience?"
   - "Is this recording a decision, explaining a system, or teaching a process?"
4. Once type is determined → invoke the appropriate doc-type-* skill
5. If truly ambiguous → suggest 2-3 most likely options and let user choose
</WORKFLOW>

<CLARIFYING_QUESTIONS>
When the intent is unclear, ask one of these:

1. **Purpose-focused**: "What's the main goal of this documentation?
   (a) Record a decision, (b) Explain how something works, (c) Teach how to do something"

2. **Audience-focused**: "Who will read this documentation?
   (a) Developers integrating with an API, (b) Ops team running the system, (c) New team members learning the codebase"

3. **Content-focused**: "What will this document primarily contain?
   (a) Steps and procedures, (b) Technical specifications, (c) Analysis and recommendations"
</CLARIFYING_QUESTIONS>

<EXAMPLES>

**Example 1**: User says "Document the new feature"
→ Ambiguous - could be architecture, API, or guide
→ Ask: "What aspect of the feature? The system design (architecture), the API endpoints (api), or how to use it (guide)?"

**Example 2**: User says "Create docs for our database"
→ Likely dataset (schema) or architecture (design)
→ Ask: "Are you documenting the schema/fields (dataset) or the overall database architecture and design decisions (architecture)?"

**Example 3**: User says "Write up the results from our security review"
→ Clear match → doc-type-audit
→ Recommend: "This sounds like an audit report. I'll use the audit document type."

</EXAMPLES>
