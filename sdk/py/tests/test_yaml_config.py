"""
Tests for unified YAML configuration loader.
"""

import os
import tempfile
import shutil
from pathlib import Path
from typing import Dict, Any
import pytest
import yaml

from fractary_core.common.yaml_config import (
    load_yaml_config,
    write_yaml_config,
    substitute_env_vars,
    find_project_root,
    config_exists,
    get_config_path,
    get_core_dir,
    validate_env_vars,
)


@pytest.fixture
def temp_dir(tmp_path):
    """Create a temporary directory for tests."""
    yield tmp_path
    # Cleanup is automatic with tmp_path


@pytest.fixture
def original_env():
    """Save and restore environment variables."""
    original = os.environ.copy()
    yield
    os.environ.clear()
    os.environ.update(original)


@pytest.fixture(autouse=True)
def clean_test_env(original_env):
    """Clean test environment variables before each test."""
    for key in ['TEST_VAR', 'TEST_TOKEN', 'MISSING_VAR', 'MALICIOUS_VAR']:
        os.environ.pop(key, None)


class TestSubstituteEnvVars:
    """Tests for substituteEnvVars function."""

    def test_substitute_environment_variables(self):
        """Test basic environment variable substitution."""
        os.environ['TEST_VAR'] = 'test-value'

        result = substitute_env_vars('token: ${TEST_VAR}', warn_missing=False)

        assert result == 'token: test-value'

    def test_substitute_multiple_variables(self):
        """Test substituting multiple environment variables."""
        os.environ['TEST_VAR'] = 'value1'
        os.environ['TEST_TOKEN'] = 'value2'

        result = substitute_env_vars('var: ${TEST_VAR}\ntoken: ${TEST_TOKEN}', warn_missing=False)

        assert result == 'var: value1\ntoken: value2'

    def test_use_default_value(self):
        """Test using default value when variable not set."""
        result = substitute_env_vars('token: ${MISSING_VAR:-default}', warn_missing=False)

        assert result == 'token: default'

    def test_prefer_env_var_over_default(self):
        """Test that env var is preferred over default value."""
        os.environ['TEST_VAR'] = 'actual'

        result = substitute_env_vars('token: ${TEST_VAR:-default}', warn_missing=False)

        assert result == 'token: actual'

    def test_keep_placeholder_when_missing(self):
        """Test keeping placeholder when variable not set and no default."""
        result = substitute_env_vars('token: ${MISSING_VAR}', warn_missing=False)

        assert result == 'token: ${MISSING_VAR}'

    def test_warn_about_missing_variables(self, capsys):
        """Test warning about missing variables."""
        substitute_env_vars('token: ${MISSING_VAR}', warn_missing=True)

        captured = capsys.readouterr()
        assert 'MISSING_VAR' in captured.out

    def test_no_warn_when_disabled(self, capsys):
        """Test no warning when warn_missing is False."""
        substitute_env_vars('token: ${MISSING_VAR}', warn_missing=False)

        captured = capsys.readouterr()
        assert 'MISSING_VAR' not in captured.out

    def test_handle_complex_default_values(self):
        """Test handling complex default values."""
        result = substitute_env_vars('url: ${API_URL:-https://api.example.com}', warn_missing=False)

        assert result == 'url: https://api.example.com'

    def test_handle_empty_string_env_var(self):
        """Test handling empty string environment variable."""
        os.environ['TEST_VAR'] = ''

        result = substitute_env_vars('token: ${TEST_VAR}', warn_missing=False)

        assert result == 'token: '

    def test_not_substitute_invalid_patterns(self):
        """Test that invalid patterns are not substituted."""
        result = substitute_env_vars('token: $TEST_VAR', warn_missing=False)

        assert result == 'token: $TEST_VAR'

    def test_not_substitute_lowercase_variables(self):
        """Test that lowercase variables are not substituted."""
        os.environ['test_var'] = 'should-not-match'

        result = substitute_env_vars('token: ${test_var}', warn_missing=False)

        assert result == 'token: ${test_var}'


class TestFindProjectRoot:
    """Tests for findProjectRoot function."""

    def test_find_root_with_fractary_directory(self, temp_dir):
        """Test finding project root with .fractary directory."""
        # Create .fractary directory
        fractary_dir = temp_dir / '.fractary'
        fractary_dir.mkdir()

        # Create subdirectory
        sub_dir = temp_dir / 'sub' / 'dir'
        sub_dir.mkdir(parents=True)

        root = find_project_root(str(sub_dir))

        assert root == str(temp_dir)

    def test_find_root_with_git_directory(self, temp_dir):
        """Test finding project root with .git directory."""
        # Create .git directory
        git_dir = temp_dir / '.git'
        git_dir.mkdir()

        # Create subdirectory
        sub_dir = temp_dir / 'sub' / 'dir'
        sub_dir.mkdir(parents=True)

        root = find_project_root(str(sub_dir))

        assert root == str(temp_dir)

    def test_return_start_dir_if_no_marker(self, temp_dir):
        """Test returning start directory if no marker found."""
        sub_dir = temp_dir / 'sub' / 'dir'
        sub_dir.mkdir(parents=True)

        root = find_project_root(str(sub_dir))

        assert root == str(sub_dir)

    def test_use_current_directory(self, temp_dir):
        """Test using current directory when no start_dir provided."""
        fractary_dir = temp_dir / '.fractary'
        fractary_dir.mkdir()

        original_cwd = os.getcwd()
        try:
            os.chdir(str(temp_dir))
            root = find_project_root()
            assert root == str(temp_dir)
        finally:
            os.chdir(original_cwd)

    def test_prefer_fractary_over_git(self, temp_dir):
        """Test preferring .fractary over .git."""
        # Create both markers
        (temp_dir / '.fractary').mkdir()
        (temp_dir / '.git').mkdir()

        sub_dir = temp_dir / 'sub'
        sub_dir.mkdir()

        root = find_project_root(str(sub_dir))

        assert root == str(temp_dir)


class TestConfigExists:
    """Tests for configExists function."""

    def test_return_true_when_exists(self, temp_dir):
        """Test returning true when config exists."""
        core_dir = temp_dir / '.fractary' / 'core'
        core_dir.mkdir(parents=True)
        (core_dir / 'config.yaml').write_text('version: "2.0"')

        exists = config_exists(str(temp_dir))

        assert exists is True

    def test_return_false_when_not_exists(self, temp_dir):
        """Test returning false when config does not exist."""
        exists = config_exists(str(temp_dir))

        assert exists is False

    def test_auto_detect_project_root(self, temp_dir):
        """Test auto-detecting project root."""
        core_dir = temp_dir / '.fractary' / 'core'
        core_dir.mkdir(parents=True)
        (core_dir / 'config.yaml').write_text('version: "2.0"')

        original_cwd = os.getcwd()
        try:
            os.chdir(str(temp_dir))
            exists = config_exists()
            assert exists is True
        finally:
            os.chdir(original_cwd)


class TestGetConfigPath:
    """Tests for getConfigPath function."""

    def test_return_config_path(self, temp_dir):
        """Test returning config path for given project root."""
        config_path = get_config_path(str(temp_dir))

        expected = str(temp_dir / '.fractary' / 'core' / 'config.yaml')
        assert config_path == expected

    def test_auto_detect_project_root(self, temp_dir):
        """Test auto-detecting project root."""
        (temp_dir / '.fractary').mkdir()

        original_cwd = os.getcwd()
        try:
            os.chdir(str(temp_dir))
            config_path = get_config_path()
            expected = str(temp_dir / '.fractary' / 'core' / 'config.yaml')
            assert config_path == expected
        finally:
            os.chdir(original_cwd)


class TestGetCoreDir:
    """Tests for getCoreDir function."""

    def test_return_core_directory_path(self, temp_dir):
        """Test returning core directory path."""
        core_dir = get_core_dir(str(temp_dir))

        expected = str(temp_dir / '.fractary' / 'core')
        assert core_dir == expected

    def test_auto_detect_project_root(self, temp_dir):
        """Test auto-detecting project root."""
        (temp_dir / '.fractary').mkdir()

        original_cwd = os.getcwd()
        try:
            os.chdir(str(temp_dir))
            core_dir = get_core_dir()
            expected = str(temp_dir / '.fractary' / 'core')
            assert core_dir == expected
        finally:
            os.chdir(original_cwd)


class TestLoadYamlConfig:
    """Tests for loadYamlConfig function."""

    def test_load_valid_yaml_config(self, temp_dir):
        """Test loading valid YAML configuration."""
        core_dir = temp_dir / '.fractary' / 'core'
        core_dir.mkdir(parents=True)

        config_content = """
version: "2.0"
work:
  active_handler: github
  handlers:
    github:
      owner: test
      repo: test
      token: test-token
"""

        (core_dir / 'config.yaml').write_text(config_content)

        config = load_yaml_config(project_root=str(temp_dir))

        assert config is not None
        assert config['version'] == '2.0'
        assert config['work']['active_handler'] == 'github'

    def test_substitute_environment_variables(self, temp_dir):
        """Test substituting environment variables in config."""
        os.environ['TEST_TOKEN'] = 'secret-token'

        core_dir = temp_dir / '.fractary' / 'core'
        core_dir.mkdir(parents=True)

        config_content = """
version: "2.0"
work:
  active_handler: github
  handlers:
    github:
      token: ${TEST_TOKEN}
"""

        (core_dir / 'config.yaml').write_text(config_content)

        config = load_yaml_config(project_root=str(temp_dir))

        assert config['work']['handlers']['github']['token'] == 'secret-token'

    def test_return_none_when_not_exists(self, temp_dir):
        """Test returning None when config does not exist."""
        config = load_yaml_config(project_root=str(temp_dir))

        assert config is None

    def test_throw_when_missing_and_required(self, temp_dir):
        """Test throwing error when config missing and throw_if_missing is True."""
        with pytest.raises(FileNotFoundError, match='Configuration file not found'):
            load_yaml_config(project_root=str(temp_dir), throw_if_missing=True)

    def test_throw_on_invalid_yaml(self, temp_dir):
        """Test throwing error on invalid YAML."""
        core_dir = temp_dir / '.fractary' / 'core'
        core_dir.mkdir(parents=True)

        (core_dir / 'config.yaml').write_text('invalid: yaml: syntax:')

        with pytest.raises(Exception, match='Failed to load config'):
            load_yaml_config(project_root=str(temp_dir))

    def test_throw_when_config_not_object(self, temp_dir):
        """Test throwing error when config is not an object."""
        core_dir = temp_dir / '.fractary' / 'core'
        core_dir.mkdir(parents=True)

        (core_dir / 'config.yaml').write_text('just a string')

        with pytest.raises(ValueError, match='Invalid configuration: must be a YAML object'):
            load_yaml_config(project_root=str(temp_dir))

    def test_warn_when_version_missing(self, temp_dir, capsys):
        """Test warning when version field is missing."""
        core_dir = temp_dir / '.fractary' / 'core'
        core_dir.mkdir(parents=True)

        (core_dir / 'config.yaml').write_text('work: {}')

        load_yaml_config(project_root=str(temp_dir))

        captured = capsys.readouterr()
        assert 'missing version field' in captured.out

    def test_auto_detect_project_root(self, temp_dir):
        """Test auto-detecting project root."""
        core_dir = temp_dir / '.fractary' / 'core'
        core_dir.mkdir(parents=True)
        (core_dir / 'config.yaml').write_text('version: "2.0"')

        original_cwd = os.getcwd()
        try:
            os.chdir(str(temp_dir))
            config = load_yaml_config()
            assert config is not None
            assert config['version'] == '2.0'
        finally:
            os.chdir(original_cwd)

    def test_handle_complex_config_structure(self, temp_dir):
        """Test handling complex configuration structure."""
        core_dir = temp_dir / '.fractary' / 'core'
        core_dir.mkdir(parents=True)

        config_content = """
version: "2.0"
work:
  active_handler: github
  handlers:
    github:
      owner: myorg
      repo: myrepo
      classification:
        feature: [feature, enhancement]
        bug: [bug, fix]
  defaults:
    auto_assign: false
repo:
  active_handler: github
  handlers:
    github:
      token: test
  defaults:
    default_branch: main
logs:
  schema_version: "2.0"
  storage:
    local_path: /logs
file:
  schema_version: "1.0"
  active_handler: local
spec:
  schema_version: "1.0"
  storage:
    local_path: /specs
docs:
  schema_version: "1.1"
  doc_types:
    adr:
      enabled: true
"""

        (core_dir / 'config.yaml').write_text(config_content)

        config = load_yaml_config(project_root=str(temp_dir))

        assert config is not None
        assert config['work']['active_handler'] == 'github'
        assert config['repo']['active_handler'] == 'github'
        assert config['logs']['schema_version'] == '2.0'
        assert config['file']['schema_version'] == '1.0'
        assert config['spec']['schema_version'] == '1.0'
        assert config['docs']['schema_version'] == '1.1'


class TestWriteYamlConfig:
    """Tests for writeYamlConfig function."""

    def test_write_config_to_file(self, temp_dir):
        """Test writing configuration to file."""
        config = {
            'version': '2.0',
            'work': {
                'active_handler': 'github',
                'handlers': {
                    'github': {
                        'owner': 'test',
                        'repo': 'test',
                        'token': '${GITHUB_TOKEN}',
                    },
                },
            },
        }

        write_yaml_config(config, str(temp_dir))

        config_path = temp_dir / '.fractary' / 'core' / 'config.yaml'
        assert config_path.exists()

        content = config_path.read_text()
        assert 'version: "2.0"' in content or "version: '2.0'" in content
        assert 'active_handler: github' in content

    def test_create_directory_if_not_exists(self, temp_dir):
        """Test creating directory if it does not exist."""
        config = {'version': '2.0'}

        write_yaml_config(config, str(temp_dir))

        core_dir = temp_dir / '.fractary' / 'core'
        assert core_dir.exists()

    def test_preserve_env_var_placeholders(self, temp_dir):
        """Test preserving environment variable placeholders."""
        config = {
            'version': '2.0',
            'work': {
                'active_handler': 'github',
                'handlers': {
                    'github': {
                        'token': '${GITHUB_TOKEN}',
                    },
                },
            },
        }

        write_yaml_config(config, str(temp_dir))

        config_path = temp_dir / '.fractary' / 'core' / 'config.yaml'
        content = config_path.read_text()

        assert '${GITHUB_TOKEN}' in content

    def test_auto_detect_project_root(self, temp_dir):
        """Test auto-detecting project root."""
        (temp_dir / '.fractary').mkdir()

        config = {'version': '2.0'}

        original_cwd = os.getcwd()
        try:
            os.chdir(str(temp_dir))
            write_yaml_config(config)
            config_path = temp_dir / '.fractary' / 'core' / 'config.yaml'
            assert config_path.exists()
        finally:
            os.chdir(original_cwd)


class TestValidateEnvVars:
    """Tests for validateEnvVars function."""

    def test_return_empty_when_all_set(self):
        """Test returning empty array when all vars are set."""
        os.environ['TEST_TOKEN'] = 'value'

        config = {
            'version': '2.0',
            'work': {
                'active_handler': 'github',
                'handlers': {
                    'github': {
                        'token': '${TEST_TOKEN}',
                    },
                },
            },
        }

        missing = validate_env_vars(config)

        assert missing == []

    def test_return_missing_variable_names(self):
        """Test returning missing variable names."""
        config = {
            'version': '2.0',
            'work': {
                'active_handler': 'github',
                'handlers': {
                    'github': {
                        'token': '${MISSING_TOKEN}',
                    },
                },
            },
        }

        missing = validate_env_vars(config)

        assert 'MISSING_TOKEN' in missing

    def test_not_report_vars_with_defaults(self):
        """Test not reporting vars with defaults."""
        config = {
            'version': '2.0',
            'work': {
                'active_handler': 'github',
                'handlers': {
                    'github': {
                        'api_url': '${API_URL:-https://api.github.com}',
                    },
                },
            },
        }

        missing = validate_env_vars(config)

        assert missing == []

    def test_return_unique_variable_names(self):
        """Test returning unique variable names."""
        config = {
            'version': '2.0',
            'work': {
                'active_handler': 'github',
                'handlers': {
                    'github': {
                        'token': '${MISSING_TOKEN}',
                    },
                },
            },
            'repo': {
                'active_handler': 'github',
                'handlers': {
                    'github': {
                        'token': '${MISSING_TOKEN}',
                    },
                },
            },
        }

        missing = validate_env_vars(config)

        assert missing == ['MISSING_TOKEN']

    def test_handle_multiple_missing_variables(self):
        """Test handling multiple missing variables."""
        config = {
            'version': '2.0',
            'work': {
                'active_handler': 'github',
                'handlers': {
                    'github': {
                        'token': '${GITHUB_TOKEN}',
                    },
                },
            },
            'repo': {
                'active_handler': 'gitlab',
                'handlers': {
                    'gitlab': {
                        'token': '${GITLAB_TOKEN}',
                    },
                },
            },
        }

        missing = validate_env_vars(config)

        assert 'GITHUB_TOKEN' in missing
        assert 'GITLAB_TOKEN' in missing


class TestSecurity:
    """Security tests for YAML config system."""

    def test_prevent_yaml_code_injection(self, temp_dir):
        """Test preventing YAML code injection attacks."""
        core_dir = temp_dir / '.fractary' / 'core'
        core_dir.mkdir(parents=True)

        # Test that malicious YAML tags are rejected by yaml.safe_load()
        # This YAML string contains a Python object tag that would execute code
        # with yaml.unsafe_load() but should be safely rejected by yaml.safe_load()
        malicious_yaml = """
version: "2.0"
malicious: !!python/object/new:type
  args: ["z", !!python/tuple [], {"extend": !!python/name:exec }]
  listitems: "print('code executed')"
"""

        (core_dir / 'config.yaml').write_text(malicious_yaml)

        # Should fail to parse safely, not execute code
        with pytest.raises(Exception):
            load_yaml_config(project_root=str(temp_dir))

    def test_safely_handle_path_traversal(self, temp_dir):
        """Test safely handling path traversal attempts."""
        # Attempt path traversal in findProjectRoot
        malicious_path = str(temp_dir / '..' / '..' / '..' / 'etc')

        result = find_project_root(malicious_path)

        # Should handle gracefully
        assert result is not None
        assert isinstance(result, str)

    def test_not_execute_shell_commands_in_env_vars(self, temp_dir):
        """Test not executing shell commands in environment variable values."""
        # Set env var with shell command syntax
        os.environ['MALICIOUS_VAR'] = '$(echo "malicious command")'

        result = substitute_env_vars('cmd: ${MALICIOUS_VAR}', warn_missing=False)

        # Should substitute literally as string, not execute
        assert result == 'cmd: $(echo "malicious command")'

        # Verify it's treated as plain string in config
        core_dir = temp_dir / '.fractary' / 'core'
        core_dir.mkdir(parents=True)

        config_content = """
version: "2.0"
test: ${MALICIOUS_VAR}
"""

        (core_dir / 'config.yaml').write_text(config_content)

        config = load_yaml_config(project_root=str(temp_dir))

        # Value should be literal string, not executed
        assert config['test'] == '$(echo "malicious command")'

    def test_handle_special_characters_in_defaults(self):
        """Test handling special characters in default values."""
        result = substitute_env_vars(
            'value: ${MISSING:-https://example.com?param=1&other=2}',
            warn_missing=False
        )

        assert result == 'value: https://example.com?param=1&other=2'

    def test_not_allow_regex_injection(self):
        """Test not allowing regex injection in variable names."""
        os.environ['.*'] = 'should-not-match'

        result = substitute_env_vars('value: ${SAFE_VAR}', warn_missing=False)

        # Should keep placeholder, not match regex pattern
        assert result == 'value: ${SAFE_VAR}'
