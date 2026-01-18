#!/usr/bin/env python3
"""YAML Helper for File Plugin - Parse YAML configs without yq dependency"""
import yaml
import json
import sys
import re
import os

if len(sys.argv) < 3:
    print("Usage: yaml_helper.py <file> <path>", file=sys.stderr)
    sys.exit(1)

yaml_file = sys.argv[1]
path = sys.argv[2]

# Validate inputs to prevent information disclosure and path traversal
def validate_file_path(file_path):
    """Validate file path to prevent directory traversal attacks"""
    # Check for null bytes
    if '\0' in file_path:
        print("Error: Null byte in file path", file=sys.stderr)
        sys.exit(1)

    # Check for directory traversal
    if '..' in file_path:
        print("Error: Directory traversal detected in file path", file=sys.stderr)
        sys.exit(1)

    # Resolve to canonical path and ensure it's within allowed directory
    try:
        canonical = os.path.realpath(file_path)
        cwd = os.path.realpath('.')
        if not canonical.startswith(cwd):
            print("Error: File path escapes base directory", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"Error: Invalid file path: {e}", file=sys.stderr)
        sys.exit(1)

    return True

def validate_key_path(key_path):
    """Validate key path to prevent injection attacks"""
    # Only allow alphanumeric, dots, underscores, and hyphens
    if not re.match(r'^[a-zA-Z0-9._-]+$', key_path):
        print("Error: Invalid characters in key path", file=sys.stderr)
        sys.exit(1)

    # Check for suspicious patterns
    if key_path.startswith('.') or key_path.endswith('.'):
        print("Error: Key path cannot start or end with dot", file=sys.stderr)
        sys.exit(1)

    # Limit depth to prevent DoS
    if key_path.count('.') > 10:
        print("Error: Key path too deep (max 10 levels)", file=sys.stderr)
        sys.exit(1)

    return True

# Validate inputs
validate_file_path(yaml_file)
validate_key_path(path)

try:
    with open(yaml_file, 'r') as f:
        data = yaml.safe_load(f)
    
    # Navigate path (e.g., "file.schema_version" or "file.sources.specs")
    keys = path.split('.')
    result = data
    for key in keys:
        if isinstance(result, dict) and key in result:
            result = result[key]
        else:
            print("null")
            sys.exit(0)
    
    # Output as JSON if dict/list, otherwise as string
    if isinstance(result, (dict, list)):
        print(json.dumps(result))
    else:
        print(result)
        
except FileNotFoundError:
    print(f"Error: File not found: {yaml_file}", file=sys.stderr)
    sys.exit(1)
except yaml.YAMLError as e:
    print(f"Error parsing YAML: {e}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
