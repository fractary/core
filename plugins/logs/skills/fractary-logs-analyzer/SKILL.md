---
name: fractary-logs-analyzer
description: Analyze logs for patterns, errors, session summaries, or time spent — read-only analysis with date filtering
---

# Log Analyzer

Analyzes logs for patterns, errors, summaries, or time analysis. Read-only — never modifies log files.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<analysis_type>` | Yes | Type: errors, patterns, session, time |
| `--log-type <type>` | No | Filter to specific log type |
| `--issue <number>` | No | Analyze specific issue |
| `--since <date>` | No | Start date (YYYY-MM-DD) |
| `--until <date>` | No | End date (YYYY-MM-DD) |
| `--verbose` | No | Show detailed breakdown |

## Execution

Read `docs/analysis-flow.md` and follow the analysis workflow for the requested type.
