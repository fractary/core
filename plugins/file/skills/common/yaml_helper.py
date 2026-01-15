#!/usr/bin/env python3
"""YAML Helper for File Plugin - Parse YAML configs without yq dependency"""
import yaml
import json
import sys

if len(sys.argv) < 3:
    print("Usage: yaml_helper.py <file> <path>", file=sys.stderr)
    sys.exit(1)

yaml_file = sys.argv[1]
path = sys.argv[2]

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
