"""
Smoke tests for fractary-core.

Tests basic functionality and module imports.
"""

import pytest

def test_import_work_manager():
    """Test that WorkManager can be imported."""
    from fractary_core.work.manager import WorkManager
    assert WorkManager is not None

def test_import_repo_manager():
    """Test that RepoManager can be imported."""
    from fractary_core.repo.manager import RepoManager
    assert RepoManager is not None

def test_import_spec_manager():
    """Test that SpecManager can be imported."""
    from fractary_core.spec.manager import SpecManager
    assert SpecManager is not None

def test_import_log_manager():
    """Test that LogManager can be imported."""
    from fractary_core.logs.manager import LogManager
    assert LogManager is not None

def test_import_file_manager():
    """Test that FileManager can be imported."""
    from fractary_core.file.manager import FileManager
    assert FileManager is not None

def test_import_docs_manager():
    """Test that DocsManager can be imported."""
    from fractary_core.docs.manager import DocsManager
    assert DocsManager is not None

def test_work_manager_github():
    """Test creating WorkManager with GitHub config."""
    from fractary_core.work.manager import WorkManager

    config = {
        "platform": "github",
        "owner": "test-org",
        "repo": "test-repo",
        "token": "test-token",
    }
    manager = WorkManager(config)
    assert manager is not None

def test_spec_templates_exist():
    """Test that spec templates are available."""
    from fractary_core.spec.templates import list_templates, get_template

    templates = list_templates()
    assert len(templates) > 0

    basic = get_template("basic")
    assert basic is not None
    assert basic.id == "basic"

    feature = get_template("feature")
    assert feature is not None
    assert feature.id == "feature"

    bug = get_template("bug")
    assert bug is not None
    assert bug.id == "bug"

def test_version():
    """Test that version is accessible."""
    import fractary_core
    assert fractary_core.__version__ == "0.1.0"
