"""
DocsManager - Framework-agnostic documentation management.

Provides documentation creation, search, and version management.
"""

from __future__ import annotations

import os
import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Literal, Optional

import yaml


DocFormat = Literal["markdown", "html", "pdf", "text"]


@dataclass
class DocMetadata:
    """Metadata for a document."""

    title: str
    author: Optional[str] = None
    version: str = "1.0.0"
    tags: list[str] = field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class Doc:
    """Represents a documentation file."""

    id: str
    content: str
    format: DocFormat
    metadata: DocMetadata
    path: str


class DocsManager:
    """Framework-agnostic documentation management.

    Provides creation, search, and management of documentation
    with support for multiple formats and versioning.
    """

    def __init__(self, config: Optional[dict[str, Any]] = None) -> None:
        """Initialize DocsManager with optional config.

        Args:
            config: Configuration dict with 'docs_dir' and 'default_format'
        """
        self.config = config or {}
        self.docs_dir = Path(self.config.get("docs_dir", ".fractary/docs"))
        self.docs_dir.mkdir(parents=True, exist_ok=True)
        self.default_format: DocFormat = self.config.get("default_format", "markdown")

    def _get_doc_path(self, doc_id: str, format: DocFormat) -> Path:
        """Get the file path for a document."""
        extensions = {
            "markdown": ".md",
            "html": ".html",
            "pdf": ".pdf",
            "text": ".txt",
        }
        return self.docs_dir / f"{doc_id}{extensions[format]}"

    def _get_metadata_path(self, doc_id: str) -> Path:
        """Get the metadata file path for a document."""
        return self.docs_dir / f"{doc_id}.meta.yaml"

    def create_doc(
        self,
        id: str,
        content: str,
        metadata: DocMetadata,
        format: Optional[DocFormat] = None,
    ) -> Doc:
        """Create a new documentation file.

        Args:
            id: Document identifier
            content: Document content
            metadata: Document metadata
            format: Document format (default: configured default)

        Returns:
            Created Doc object
        """
        doc_format = format or self.default_format
        doc_path = self._get_doc_path(id, doc_format)
        meta_path = self._get_metadata_path(id)

        # Update metadata timestamps
        full_metadata = DocMetadata(
            title=metadata.title,
            author=metadata.author,
            version=metadata.version,
            tags=metadata.tags,
            created_at=metadata.created_at or datetime.now(),
            updated_at=datetime.now(),
        )

        # Write document content
        doc_path.write_text(content, encoding="utf-8")

        # Write metadata
        meta_dict = {
            "title": full_metadata.title,
            "author": full_metadata.author,
            "version": full_metadata.version,
            "tags": full_metadata.tags,
            "created_at": full_metadata.created_at.isoformat() if full_metadata.created_at else None,
            "updated_at": full_metadata.updated_at.isoformat() if full_metadata.updated_at else None,
        }
        meta_path.write_text(yaml.dump(meta_dict), encoding="utf-8")

        return Doc(
            id=id,
            content=content,
            format=doc_format,
            metadata=full_metadata,
            path=str(doc_path),
        )

    def get_doc(self, doc_id: str) -> Optional[Doc]:
        """Get a document by ID.

        Args:
            doc_id: Document identifier

        Returns:
            Doc object or None if not found
        """
        # Try to find doc with any format
        for format in ["markdown", "html", "pdf", "text"]:
            doc_path = self._get_doc_path(doc_id, format)  # type: ignore
            if doc_path.exists():
                content = doc_path.read_text(encoding="utf-8")

                # Load metadata
                meta_path = self._get_metadata_path(doc_id)
                if meta_path.exists():
                    meta_dict = yaml.safe_load(meta_path.read_text(encoding="utf-8"))
                    metadata = DocMetadata(
                        title=meta_dict.get("title", doc_id),
                        author=meta_dict.get("author"),
                        version=meta_dict.get("version", "1.0.0"),
                        tags=meta_dict.get("tags", []),
                        created_at=(
                            datetime.fromisoformat(meta_dict["created_at"])
                            if meta_dict.get("created_at")
                            else None
                        ),
                        updated_at=(
                            datetime.fromisoformat(meta_dict["updated_at"])
                            if meta_dict.get("updated_at")
                            else None
                        ),
                    )
                else:
                    metadata = DocMetadata(title=doc_id)

                return Doc(
                    id=doc_id,
                    content=content,
                    format=format,  # type: ignore
                    metadata=metadata,
                    path=str(doc_path),
                )

        return None

    def update_doc(
        self,
        doc_id: str,
        content: Optional[str] = None,
        metadata: Optional[DocMetadata] = None,
    ) -> Optional[Doc]:
        """Update an existing document.

        Args:
            doc_id: Document identifier
            content: New content (optional)
            metadata: Updated metadata (optional)

        Returns:
            Updated Doc object or None if not found
        """
        doc = self.get_doc(doc_id)
        if not doc:
            return None

        # Update content if provided
        if content is not None:
            doc_path = self._get_doc_path(doc_id, doc.format)
            doc_path.write_text(content, encoding="utf-8")
            doc.content = content

        # Update metadata if provided
        if metadata:
            metadata.updated_at = datetime.now()
            meta_path = self._get_metadata_path(doc_id)
            meta_dict = {
                "title": metadata.title,
                "author": metadata.author,
                "version": metadata.version,
                "tags": metadata.tags,
                "created_at": metadata.created_at.isoformat() if metadata.created_at else None,
                "updated_at": metadata.updated_at.isoformat() if metadata.updated_at else None,
            }
            meta_path.write_text(yaml.dump(meta_dict), encoding="utf-8")
            doc.metadata = metadata

        return doc

    def delete_doc(self, doc_id: str) -> bool:
        """Delete a document.

        Args:
            doc_id: Document identifier

        Returns:
            True if deleted successfully
        """
        deleted = False

        # Delete all format variants
        for format in ["markdown", "html", "pdf", "text"]:
            doc_path = self._get_doc_path(doc_id, format)  # type: ignore
            if doc_path.exists():
                doc_path.unlink()
                deleted = True

        # Delete metadata
        meta_path = self._get_metadata_path(doc_id)
        if meta_path.exists():
            meta_path.unlink()
            deleted = True

        return deleted

    def list_docs(
        self,
        tag: Optional[str] = None,
        format: Optional[DocFormat] = None,
    ) -> list[Doc]:
        """List all documents with optional filtering.

        Args:
            tag: Filter by tag
            format: Filter by format

        Returns:
            List of Doc objects
        """
        docs = []
        seen_ids = set()

        for file_path in self.docs_dir.glob("*"):
            if file_path.suffix in [".md", ".html", ".pdf", ".txt"]:
                doc_id = file_path.stem
                if doc_id in seen_ids:
                    continue

                doc = self.get_doc(doc_id)
                if doc:
                    # Apply filters
                    if format and doc.format != format:
                        continue
                    if tag and tag not in doc.metadata.tags:
                        continue

                    docs.append(doc)
                    seen_ids.add(doc_id)

        return sorted(docs, key=lambda d: d.metadata.updated_at or datetime.min, reverse=True)

    def search_docs(self, query: str) -> list[Doc]:
        """Search documents by content or title.

        Args:
            query: Search query string

        Returns:
            List of matching Doc objects
        """
        results = []
        query_lower = query.lower()

        for doc in self.list_docs():
            # Search in title and content
            if (
                query_lower in doc.metadata.title.lower()
                or query_lower in doc.content.lower()
            ):
                results.append(doc)

        return results
