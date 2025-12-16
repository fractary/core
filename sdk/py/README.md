# fractary-core (Python)

> **⚠️ Alpha Release (v0.1.0)** - This is an early-stage release with limited platform support. Only GitHub is currently implemented for work tracking. Repository providers are not yet implemented.

Core primitives for FABER workflows providing framework-agnostic abstractions for:

- **Work Tracking** - ✅ GitHub Issues (fully implemented); ⚠️ Jira and Linear (not yet implemented)
- **Repository Management** - ✅ Local Git operations (fully implemented); ⚠️ Platform providers (not yet implemented)
- **Specifications** - Creation, validation, and management of work specifications
- **Logging** - Structured logging for FABER workflows with phase tracking
- **File Storage** - Cross-platform file operations with support for local and cloud storage
- **Documentation** - Documentation management with support for multiple formats

## Installation

```bash
pip install fractary-core
```

## Usage

### Work Tracking

```python
from fractary_core.work import WorkManager

# Initialize work manager
work = WorkManager({
    "platform": "github",
    "owner": "your-org",
    "repo": "your-repo"
})

# Fetch an issue
issue = work.fetch_issue("123")
print(f"Issue: {issue.title}")

# Create a new issue
new_issue = work.create_issue(
    title="Implement new feature",
    body="Feature description",
    labels=["enhancement"]
)

# Classify work type
work_type = work.classify_work_type(issue)
print(f"Work type: {work_type.type} (confidence: {work_type.confidence})")
```

### Repository Management

```python
from fractary_core.repo import RepoManager

# Initialize repo manager
repo = RepoManager({
    "platform": "github",
    "default_branch": "main"
})

# Create a branch
branch = repo.create_branch("feat/new-feature", base="main")

# Make a semantic commit
commit = repo.commit(
    message="Add new validation logic",
    commit_type="feat",
    scope="validation",
    work_id="123"
)

# Create a pull request
pr = repo.create_pr(
    title="Add validation feature",
    body="Implements new validation logic",
    draft=False
)
```

### Specifications

```python
from fractary_core.spec import SpecManager

# Initialize spec manager
spec = SpecManager({"specs_dir": "specs"})

# Create a new specification
new_spec = spec.create_spec(
    title="User Authentication",
    template="feature",
    work_id="123",
    context="Implement OAuth2 authentication"
)

# Validate completeness
validation = spec.validate_spec(new_spec.id)
print(f"Completeness: {validation.completeness * 100}%")

# Generate refinement questions
questions = spec.generate_refinement_questions(new_spec.id)
for q in questions:
    print(f"- {q}")
```

### Logging

```python
from fractary_core.logs import LogManager, FaberPhase, LogLevel

# Initialize log manager
logs = LogManager({"logs_dir": ".fractary/logs"})

# Start a workflow
workflow = logs.start_workflow("workflow-001", work_id="123")

# Log phase progress
logs.start_phase(FaberPhase.FRAME)
logs.info(FaberPhase.FRAME, "Analyzing requirements")
logs.end_phase(FaberPhase.FRAME, status="completed")

# End workflow
logs.end_workflow(status="completed", summary={"total_phases": 5})
```

### File Storage

```python
from fractary_core.file import FileManager

# Initialize file manager
files = FileManager({"base_path": ".fractary/storage"})

# Write a file
file_id = await files.write("documents/spec.md", "# Specification content")

# Read a file
content = await files.read("documents/spec.md")

# List files
file_list = await files.list("documents/")
```

### Documentation

```python
from fractary_core.docs import DocsManager

# Initialize docs manager
docs = DocsManager({"docs_dir": ".fractary/docs"})

# Create documentation
doc = await docs.create_doc(
    id="api-guide",
    content="# API Guide\n\nAPI documentation here...",
    metadata={
        "title": "API Guide",
        "author": "Team",
        "version": "1.0.0"
    },
    format="markdown"
)

# Search documentation
results = await docs.search_docs("authentication")
```

## Development

```bash
# Install with dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black fractary_core tests

# Lint
ruff fractary_core tests

# Type check
mypy fractary_core
```

## License

MIT
