"""
FileManager - Framework-agnostic file storage abstraction.

Provides unified file operations with support for local and cloud storage.
"""

from __future__ import annotations

import os
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional


@dataclass
class FileInfo:
    """Information about a file."""

    path: str
    size: int
    modified: float
    is_directory: bool


class FileManager:
    """Framework-agnostic file storage abstraction.

    Provides file operations with support for local storage
    and extensibility for cloud providers.
    """

    def __init__(self, config: Optional[dict[str, Any]] = None) -> None:
        """Initialize FileManager with optional config.

        Args:
            config: Configuration dict with 'base_path' for storage root
        """
        self.config = config or {}
        self.base_path = Path(self.config.get("base_path", ".fractary/storage"))
        self.base_path.mkdir(parents=True, exist_ok=True)

    def _resolve_path(self, path: str) -> Path:
        """Resolve a relative path to absolute within base_path."""
        full_path = self.base_path / path
        # Ensure path is within base_path (security check)
        try:
            full_path.resolve().relative_to(self.base_path.resolve())
        except ValueError:
            raise ValueError(f"Path {path} is outside base storage directory")
        return full_path

    def write(self, path: str, content: str | bytes) -> str:
        """Write content to a file.

        Args:
            path: Relative path to file
            content: String or bytes content to write

        Returns:
            Absolute path to written file
        """
        file_path = self._resolve_path(path)
        file_path.parent.mkdir(parents=True, exist_ok=True)

        mode = "wb" if isinstance(content, bytes) else "w"
        with open(file_path, mode) as f:
            f.write(content)

        return str(file_path)

    def read(self, path: str, binary: bool = False) -> Optional[str | bytes]:
        """Read content from a file.

        Args:
            path: Relative path to file
            binary: Whether to read in binary mode

        Returns:
            File content or None if file doesn't exist
        """
        file_path = self._resolve_path(path)

        if not file_path.exists():
            return None

        mode = "rb" if binary else "r"
        with open(file_path, mode) as f:
            return f.read()

    def exists(self, path: str) -> bool:
        """Check if a file or directory exists.

        Args:
            path: Relative path to check

        Returns:
            True if path exists
        """
        file_path = self._resolve_path(path)
        return file_path.exists()

    def delete(self, path: str) -> bool:
        """Delete a file or directory.

        Args:
            path: Relative path to delete

        Returns:
            True if deleted successfully
        """
        file_path = self._resolve_path(path)

        if not file_path.exists():
            return False

        if file_path.is_dir():
            shutil.rmtree(file_path)
        else:
            file_path.unlink()

        return True

    def list(self, path: str = "") -> list[FileInfo]:
        """List files in a directory.

        Args:
            path: Relative directory path (empty for root)

        Returns:
            List of FileInfo objects
        """
        dir_path = self._resolve_path(path)

        if not dir_path.exists() or not dir_path.is_dir():
            return []

        files = []
        for item in dir_path.iterdir():
            stat = item.stat()
            files.append(
                FileInfo(
                    path=str(item.relative_to(self.base_path)),
                    size=stat.st_size,
                    modified=stat.st_mtime,
                    is_directory=item.is_dir(),
                )
            )

        return sorted(files, key=lambda f: f.path)

    def copy(self, source: str, destination: str) -> str:
        """Copy a file or directory.

        Args:
            source: Source path
            destination: Destination path

        Returns:
            Absolute path to copied file/directory
        """
        src_path = self._resolve_path(source)
        dst_path = self._resolve_path(destination)

        if not src_path.exists():
            raise FileNotFoundError(f"Source {source} does not exist")

        dst_path.parent.mkdir(parents=True, exist_ok=True)

        if src_path.is_dir():
            shutil.copytree(src_path, dst_path, dirs_exist_ok=True)
        else:
            shutil.copy2(src_path, dst_path)

        return str(dst_path)

    def move(self, source: str, destination: str) -> str:
        """Move a file or directory.

        Args:
            source: Source path
            destination: Destination path

        Returns:
            Absolute path to moved file/directory
        """
        src_path = self._resolve_path(source)
        dst_path = self._resolve_path(destination)

        if not src_path.exists():
            raise FileNotFoundError(f"Source {source} does not exist")

        dst_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src_path), str(dst_path))

        return str(dst_path)
