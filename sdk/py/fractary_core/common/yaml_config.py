"""
Unified YAML Configuration Loader

Loads and parses `.fractary/core/config.yaml` with environment variable substitution.
Provides a single source of truth for all plugin configurations.
"""

import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml


def load_yaml_config(
    project_root: Optional[Path] = None,
    warn_missing_env_vars: bool = True,
    throw_if_missing: bool = False,
) -> Optional[Dict[str, Any]]:
    """
    Load and parse `.fractary/core/config.yaml` with environment variable substitution.

    Args:
        project_root: Project root directory (auto-detected if not provided)
        warn_missing_env_vars: Whether to warn about missing environment variables
        throw_if_missing: Whether to throw error if config file doesn't exist

    Returns:
        Parsed configuration dict or None if not found

    Raises:
        RuntimeError: If config is invalid or throw_if_missing is True and file doesn't exist

    Example:
        >>> config = load_yaml_config()
        >>> if config and 'work' in config:
        ...     print('Work config:', config['work'])
    """
    root = project_root or find_project_root()
    config_path = root / ".fractary" / "core" / "config.yaml"

    if not config_path.exists():
        if throw_if_missing:
            raise RuntimeError(
                f"Configuration file not found: {config_path}\n"
                f"Run 'fractary-core:init' to create it."
            )
        return None

    try:
        content = config_path.read_text()
        substituted = substitute_env_vars(content, warn_missing_env_vars)
        parsed = yaml.safe_load(substituted)

        # Validate basic structure
        if not isinstance(parsed, dict):
            raise RuntimeError("Invalid configuration: must be a YAML mapping")

        if "version" not in parsed:
            print(f"Warning: Configuration missing version field in {config_path}")

        return parsed
    except Exception as e:
        raise RuntimeError(f"Failed to load config from {config_path}: {e}")


def write_yaml_config(
    config: Dict[str, Any],
    project_root: Optional[Path] = None,
) -> None:
    """
    Write unified configuration to `.fractary/core/config.yaml`.

    Args:
        config: Configuration dict to write
        project_root: Project root directory (auto-detected if not provided)

    Example:
        >>> write_yaml_config({
        ...     'version': '2.0',
        ...     'work': {
        ...         'active_handler': 'github',
        ...         'handlers': {}
        ...     }
        ... })
    """
    root = project_root or find_project_root()
    fractary_dir = root / ".fractary" / "core"
    config_path = fractary_dir / "config.yaml"

    # Ensure directory exists
    fractary_dir.mkdir(parents=True, exist_ok=True)

    # Convert to YAML with proper formatting
    yaml_content = yaml.dump(
        config,
        default_flow_style=False,
        sort_keys=False,
        indent=2,
        width=100,
    )

    config_path.write_text(yaml_content)


def substitute_env_vars(content: str, warn_missing: bool = True) -> str:
    """
    Substitute ${ENV_VAR} placeholders with actual environment variables.

    Supports:
    - ${VAR_NAME} - Replace with env var value
    - ${VAR_NAME:-default} - Replace with env var value or default if not set

    Args:
        content: Content with environment variable placeholders
        warn_missing: Whether to warn about missing environment variables

    Returns:
        Content with substituted values

    Example:
        >>> content = 'token: ${GITHUB_TOKEN}'
        >>> result = substitute_env_vars(content)
        # result: 'token: ghp_xxxxx'
    """

    def replace(match: re.Match) -> str:
        var_name = match.group(1)
        default_value = match.group(3)

        value = os.getenv(var_name)

        if value is not None:
            return value

        if default_value is not None:
            return default_value

        if warn_missing:
            print(
                f"Warning: Environment variable {var_name} not set. "
                f"Using placeholder value."
            )

        # Keep original placeholder if no value found
        return match.group(0)

    return re.sub(
        r'\$\{([A-Z_][A-Z0-9_]*)(:-([^}]+))?\}',
        replace,
        content
    )


def find_project_root(start_dir: Optional[Path] = None) -> Path:
    """
    Find project root by looking for .fractary directory or .git.

    Walks up the directory tree from start_dir until it finds:
    - A directory containing `.fractary/`
    - A directory containing `.git/`
    - The filesystem root

    Args:
        start_dir: Directory to start searching from (default: current working directory)

    Returns:
        Project root directory
    """
    current = start_dir or Path.cwd()

    while current != current.parent:
        # Check for .fractary directory
        if (current / ".fractary").exists():
            return current

        # Check for .git directory
        if (current / ".git").exists():
            return current

        # Move up one directory
        current = current.parent

    # If no marker found, return the starting directory
    return start_dir or Path.cwd()


def config_exists(project_root: Optional[Path] = None) -> bool:
    """
    Check if a valid configuration file exists.

    Args:
        project_root: Project root directory (auto-detected if not provided)

    Returns:
        True if `.fractary/core/config.yaml` exists
    """
    root = project_root or find_project_root()
    config_path = root / ".fractary" / "core" / "config.yaml"
    return config_path.exists()


def get_config_path(project_root: Optional[Path] = None) -> Path:
    """
    Get the configuration file path.

    Args:
        project_root: Project root directory (auto-detected if not provided)

    Returns:
        Full path to configuration file
    """
    root = project_root or find_project_root()
    return root / ".fractary" / "core" / "config.yaml"


def get_core_dir(project_root: Optional[Path] = None) -> Path:
    """
    Get the .fractary/core directory path.

    Args:
        project_root: Project root directory (auto-detected if not provided)

    Returns:
        Full path to .fractary/core directory
    """
    root = project_root or find_project_root()
    return root / ".fractary" / "core"


def validate_env_vars(config: Dict[str, Any]) -> List[str]:
    """
    Validate that environment variables referenced in config exist.

    Args:
        config: Configuration dict to validate

    Returns:
        List of missing environment variable names
    """
    content = yaml.dump(config)
    missing: List[str] = []

    # Find all ${VAR_NAME} references
    for match in re.finditer(r'\$\{([A-Z_][A-Z0-9_]*)(:-[^}]+)?\}', content):
        var_name = match.group(1)
        has_default = match.group(2) is not None

        # Only check if no default value provided
        if not has_default and os.getenv(var_name) is None:
            if var_name not in missing:
                missing.append(var_name)

    return missing
