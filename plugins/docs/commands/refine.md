---
name: fractary-docs:refine
description: Refine a document through gap scanning and interactive Q&A
usage: /fractary-docs:refine <id>
delegates_to: docs-refiner
triggers:
  - refine doc
  - improve spec
  - find gaps
  - review documentation quality
  - tighten spec
---

Refine a document through structural gap scanning and AI-powered Q&A improvement.

Works with ANY document type — specs, ADRs, API docs, architecture docs, guides, etc.
The refiner loads the type's required sections and standards at runtime to generate
contextually relevant questions.

The refinement process:
1. Structural scan: finds missing sections, placeholders, empty sections
2. AI analysis: identifies vague requirements, missing edge cases, contradictions
3. Question generation: prioritized questions organized by severity
4. Interactive Q&A: user answers questions, improvements are applied
5. Changelog: records refinement history in the document (if configured)

For work-linked documents, questions can be posted to the GitHub issue for team visibility.
