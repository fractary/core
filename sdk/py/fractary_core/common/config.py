"""
Configuration utilities for fractary-core.

Provides utilities for finding project roots and managing configuration.
"""

import os
from pathlib import Path
from typing import Optional


def find_project_root(start_dir: Optional[str] = None) -> Path:
    """Find the project root directory by looking for common markers.

    Args:
        start_dir: Starting directory (default: current directory)

    Returns:
        Path to project root
    """
    current_dir = Path(start_dir or os.getcwd()).resolve()

    # Common project root markers
    markers = [
        "package.json",
        ".git",
        "tsconfig.json",
        "pyproject.toml",
        "setup.py",
    ]

    while current_dir != current_dir.parent:
        # Check if any marker exists in current directory
        for marker in markers:
            if (current_dir / marker).exists():
                return current_dir

        # Move up one directory
        current_dir = current_dir.parent

    # If no marker found, return the starting directory
    return Path(start_dir or os.getcwd()).resolve()


def is_git_repository(directory: Optional[str] = None) -> bool:
    """Check if a directory is a git repository.

    Args:
        directory: Directory to check (default: current directory)

    Returns:
        True if directory contains .git
    """
    check_dir = Path(directory or os.getcwd()).resolve()
    return (check_dir / ".git").exists()


def get_fractary_dir(project_root: Optional[str] = None) -> Path:
    """Get the .fractary directory path.

    Args:
        project_root: Project root directory (default: auto-detect)

    Returns:
        Path to .fractary directory
    """
    root = Path(project_root) if project_root else find_project_root()
    return root / ".fractary"


def ensure_dir(dir_path: str | Path) -> None:
    """Ensure a directory exists.

    Args:
        dir_path: Directory path to create
    """
    Path(dir_path).mkdir(parents=True, exist_ok=True)
