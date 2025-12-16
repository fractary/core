"""
fractary-core - Core primitives for FABER workflows.

This package provides framework-agnostic abstractions for work tracking,
repository management, specifications, logging, file storage, and documentation.
"""

__version__ = "1.0.0"

from fractary_core.work.manager import WorkManager, Issue, WorkType, Comment
from fractary_core.repo.manager import RepoManager, Branch, Commit, PullRequest
from fractary_core.spec.manager import SpecManager, Specification, ValidationResult
from fractary_core.logs.manager import LogManager, LogEntry, WorkflowLog, FaberPhase, LogLevel

__all__ = [
    # Work
    "WorkManager",
    "Issue",
    "WorkType",
    "Comment",
    # Repo
    "RepoManager",
    "Branch",
    "Commit",
    "PullRequest",
    # Spec
    "SpecManager",
    "Specification",
    "ValidationResult",
    # Logs
    "LogManager",
    "LogEntry",
    "WorkflowLog",
    "FaberPhase",
    "LogLevel",
]
