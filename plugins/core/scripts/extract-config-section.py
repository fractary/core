#!/usr/bin/env python3
"""
Extract and validate a section from Fractary YAML configuration.

Usage: extract-config-section.py <config_file> <section> [validation_fields...]

Arguments:
    config_file         Path to the YAML configuration file
    section             Config section to extract (work, logs, spec, file, docs, repo)
    validation_fields   Optional fields to validate exist in the section

Output: JSON representation of the config section
Exit codes:
    0 - Success
    3 - Configuration error (file not found, missing section, invalid YAML)
"""

import sys
import json

try:
    import yaml
except ImportError:
    print("Error: PyYAML not installed. Run: pip install pyyaml", file=sys.stderr)
    sys.exit(3)


def main():
    if len(sys.argv) < 3:
        print("Usage: extract-config-section.py <config_file> <section> [validation_fields...]", file=sys.stderr)
        sys.exit(3)

    config_file = sys.argv[1]
    section = sys.argv[2]
    validation_fields = sys.argv[3:] if len(sys.argv) > 3 else []

    try:
        with open(config_file, 'r') as f:
            config = yaml.safe_load(f)

        if not isinstance(config, dict):
            print("Error: Configuration file must contain a YAML mapping", file=sys.stderr)
            sys.exit(3)

        if section not in config:
            print(f"Error: Missing '{section}' section in configuration", file=sys.stderr)
            print(f"  Config file: {config_file}", file=sys.stderr)
            sys.exit(3)

        section_config = config[section]

        if not isinstance(section_config, dict):
            print(f"Error: '{section}' section must be a mapping", file=sys.stderr)
            sys.exit(3)

        # Validate required fields if specified
        for field in validation_fields:
            # Support nested fields like "handlers.github"
            parts = field.split('.')
            current = section_config
            for part in parts:
                if not isinstance(current, dict) or part not in current:
                    print(f"Error: Missing required field: {section}.{field}", file=sys.stderr)
                    sys.exit(3)
                current = current[part]

        # Special validation for handler-based configs (work, repo, file)
        if section in ['work', 'repo', 'file']:
            if 'active_handler' in section_config:
                active_handler = section_config['active_handler']
                handlers = section_config.get('handlers', {})
                if active_handler not in handlers:
                    print(f"Error: Configuration for handler '{active_handler}' not found", file=sys.stderr)
                    print(f"  Active handler set to: {active_handler}", file=sys.stderr)
                    print(f"  But {section}.handlers.{active_handler} is missing", file=sys.stderr)
                    sys.exit(3)

        # Output section config as JSON for shell consumption
        print(json.dumps(section_config, indent=2))

    except FileNotFoundError:
        print(f"Error: Configuration file not found: {config_file}", file=sys.stderr)
        sys.exit(3)
    except yaml.YAMLError as e:
        print(f"Error: Invalid YAML in configuration file: {e}", file=sys.stderr)
        sys.exit(3)
    except Exception as e:
        print(f"Error: Failed to load configuration: {e}", file=sys.stderr)
        sys.exit(3)


if __name__ == '__main__':
    main()
