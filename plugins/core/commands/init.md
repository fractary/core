---
name: fractary-core:init
description: Initialize Fractary Core configuration - unified init for all core plugins
allowed-tools: Task(fractary-core:config-manager)
model: claude-haiku-4-5
argument-hint: '[--plugins <list>] [--work-platform <name>] [--repo-platform <name>] [--file-handler <name>] [--yes] [--force] [--context "<text>"]'
---

Delegates to fractary-core:config-manager for unified configuration of all core plugins.

Configuration is created at: .fractary/core/config.yaml (YAML format)
