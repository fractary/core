---
name: fractary-docs:archive
description: Archive a document using its type's configured archive source
usage: /fractary-docs:archive <id> [--source <name>]
delegates_to: docs-archiver
triggers:
  - archive doc
  - archive spec
  - move to archive
  - clean up old docs
---

Archive a document to its configured archive source (S3, R2, GCS, local, etc.).

Archive behavior is configured per doc type in `type.yaml`:
- `archive.source`: which file source to use
- `archive.trigger`: when archival happens
- `archive.verify_checksum`: verify integrity after copy
- `archive.delete_original`: remove local copy after archiving

For work-linked documents (those with `work_id` in frontmatter), the archiver will:
- Check if the linked work item is closed (if `work_linking.require_closed_for_archive` is set)
- Comment on the work item after successful archival (if `work_linking.comment_on_archive` is set)
