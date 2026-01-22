# Docs Toolset - CLI Reference

Command-line reference for the Docs toolset. Documentation management.

## Command Structure

```bash
fractary-core docs <action> [options]
```

## Document Commands

### docs create

Create a new document.

```bash
fractary-core docs create <id> [options]
```

**Arguments:**
- `id` - Unique document identifier

**Options:**
- `--title <text>` - Document title (required)
- `--content <text>` - Document content
- `--file <path>` - Read content from file
- `--format <format>` - Format: `markdown`, `html`, `text`
- `--type <type>` - Document type: `adr`, `api`, `guide`, `readme`
- `--tags <tags>` - Comma-separated tags
- `--author <name>` - Author name

**Examples:**
```bash
# Create markdown document
fractary-core docs create user-guide \
  --title "User Guide" \
  --content "# User Guide\n\nWelcome..."

# Create from file
fractary-core docs create api-spec \
  --title "API Specification" \
  --file ./api-docs.md \
  --type api

# Create ADR
fractary-core docs create adr-001 \
  --title "Use PostgreSQL for primary database" \
  --type adr \
  --tags "architecture,database"
```

### docs get

Get a document.

```bash
fractary-core docs get <id> [options]
```

**Arguments:**
- `id` - Document ID

**Options:**
- `--format <type>` - Output format: `raw`, `json`

**Example:**
```bash
fractary-core docs get user-guide --format raw
```

### docs update

Update a document.

```bash
fractary-core docs update <id> [options]
```

**Arguments:**
- `id` - Document ID

**Options:**
- `--title <text>` - New title
- `--content <text>` - New content
- `--file <path>` - Read content from file
- `--status <status>` - Status: `draft`, `review`, `published`, `archived`
- `--add-tags <tags>` - Add tags
- `--remove-tags <tags>` - Remove tags

**Example:**
```bash
fractary-core docs update user-guide \
  --status published \
  --add-tags "v1.0"
```

### docs delete

Delete a document.

```bash
fractary-core docs delete <id> [options]
```

**Options:**
- `--force` - Skip confirmation

### docs list

List documents.

```bash
fractary-core docs list [options]
```

**Options:**
- `--type <type>` - Filter by type
- `--tags <tags>` - Filter by tags
- `--author <name>` - Filter by author
- `--status <status>` - Filter by status
- `--format <type>` - Output format

**Examples:**
```bash
# List all documents
fractary-core docs list

# List API documentation
fractary-core docs list --type api

# List by tags
fractary-core docs list --tags "guide,user"
```

**Output:**
```
ID              TITLE                    TYPE      STATUS     UPDATED
user-guide      User Guide               guide     published  2024-01-15
api-auth        Authentication API       api       draft      2024-01-14
adr-001         Use PostgreSQL           adr       accepted   2024-01-10
getting-started Getting Started          guide     published  2024-01-08
```

## Search Commands

### docs search

Search documents.

```bash
fractary-core docs search <query> [options]
```

**Arguments:**
- `query` - Search query

**Options:**
- `--type <type>` - Filter by type
- `--tags <tags>` - Filter by tags
- `--format <type>` - Output format

**Example:**
```bash
fractary-core docs search "authentication"
```

**Output:**
```
Search Results for "authentication"
===================================

api-auth (API Documentation)
  "...implements JWT authentication for secure access..."

user-guide (Guide)
  "...users can configure authentication settings..."

adr-003 (ADR)
  "...decided to use OAuth2 for authentication..."
```

## Validation Commands

### docs validate

Validate a document.

```bash
fractary-core docs validate <id> [options]
```

**Arguments:**
- `id` - Document ID

**Options:**
- `--strict` - Fail on warnings
- `--format <type>` - Output format

**Example:**
```bash
fractary-core docs validate api-auth
```

**Output:**
```
Validation Results for api-auth
===============================

Status: VALID (with warnings)

Checks:
  ✓ Has title
  ✓ Has content
  ✓ Valid format
  ⚠ Missing description metadata
  ⚠ No version specified

Warnings:
  - Consider adding a description for better discoverability
  - Consider adding version for API documentation
```

### docs validate-all

Validate all documents.

```bash
fractary-core docs validate-all [options]
```

**Options:**
- `--type <type>` - Validate specific type
- `--fail-fast` - Stop on first failure
- `--report <file>` - Save report to file

## Audit Commands

### docs audit

Audit documentation quality.

```bash
fractary-core docs audit [options]
```

**Options:**
- `--report <type>` - Report type: `summary`, `gaps`, `quality`, `full`

**Example:**
```bash
fractary-core docs audit --report gaps
```

**Output:**
```
Documentation Gaps Report
=========================

Missing Documentation:
  - src/auth/ has no README
  - src/api/handlers/ has no documentation
  - 5 exported functions lack JSDoc comments

Incomplete Documentation:
  - api-auth: Missing error handling section
  - user-guide: Setup section is outdated

Recommendations:
  - Add README to src/auth/
  - Document API handlers
  - Update user-guide setup section
```

### docs check-consistency

Check if documentation matches code.

```bash
fractary-core docs check-consistency [options]
```

**Options:**
- `--source <dir>` - Source directory to check
- `--types <types>` - Document types to check

**Example:**
```bash
fractary-core docs check-consistency --source src/
```

**Output:**
```
Consistency Check Results
=========================

Outdated Documentation:
  api-auth.md
    - Function 'authenticate()' signature changed
    - New parameter 'refreshToken' not documented

  user-guide.md
    - References removed config option 'legacyMode'

Up-to-date: 8 documents
Outdated: 2 documents
Missing: 1 document
```

## Export Commands

### docs export

Export a document to another format.

```bash
fractary-core docs export <id> [options]
```

**Arguments:**
- `id` - Document ID

**Options:**
- `--format <format>` - Target format: `html`, `pdf`, `text`
- `--output <file>` - Output file path

**Example:**
```bash
# Export to HTML
fractary-core docs export user-guide --format html --output user-guide.html

# Export to PDF
fractary-core docs export api-auth --format pdf --output api-docs.pdf
```

## Write Commands

### docs write

Write documentation with AI assistance.

```bash
fractary-core docs write [options]
```

**Options:**
- `--type <type>` - Document type
- `--title <text>` - Document title
- `--context <text>` - Additional context
- `--source <path>` - Source code/files to document

**Example:**
```bash
fractary-core docs write \
  --type api \
  --title "User API" \
  --source src/api/user/
```

## Environment Variables

```bash
# Docs directory
export FRACTARY_DOCS_DIRECTORY=./docs

# Default format
export FRACTARY_DOCS_FORMAT=markdown

# Default tags
export FRACTARY_DOCS_DEFAULT_TAGS=project
```

## Other Interfaces

- **SDK:** [Docs API](/docs/sdk/docs.md)
- **MCP:** [Docs Tools](/docs/mcp/docs.md)
- **Plugin:** [Docs Plugin](/docs/plugins/docs.md)
- **Configuration:** [Docs Config](/docs/configuration/README.md#docs)
