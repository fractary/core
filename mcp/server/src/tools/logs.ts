import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP tool definitions for the Logs module
 * 5 tools for logging and session capture
 */
export const logsTools: Tool[] = [
  {
    name: 'fractary_logs_capture',
    description: 'Capture a log entry (session, build, deployment, etc.)',
    inputSchema: {
      type: 'object',
      required: ['type', 'title', 'content'],
      properties: {
        type: {
          type: 'string',
          enum: ['session', 'build', 'deployment', 'test', 'debug', 'audit', 'operational', 'workflow'],
          description: 'Type of log entry',
        },
        title: {
          type: 'string',
          description: 'Log title',
        },
        content: {
          type: 'string',
          description: 'Log content',
        },
        issue_number: {
          type: 'number',
          description: 'Issue number to associate with this log',
        },
        metadata: {
          type: 'object',
          description: 'Additional metadata for the log entry',
        },
      },
    },
  },
  {
    name: 'fractary_logs_search',
    description: 'Search log entries',
    inputSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        type: {
          type: 'string',
          enum: ['session', 'build', 'deployment', 'test', 'debug', 'audit', 'operational', 'workflow'],
          description: 'Filter by log type',
        },
        issue_number: {
          type: 'number',
          description: 'Filter by issue number',
        },
        since: {
          type: 'string',
          description: 'Start date (ISO 8601 format)',
        },
        until: {
          type: 'string',
          description: 'End date (ISO 8601 format)',
        },
        regex: {
          type: 'boolean',
          description: 'Use regex for query matching',
        },
      },
    },
  },
  {
    name: 'fractary_logs_archive',
    description: 'Archive old log entries',
    inputSchema: {
      type: 'object',
      properties: {
        max_age_days: {
          type: 'number',
          description: 'Archive logs older than this many days',
        },
        compress: {
          type: 'boolean',
          description: 'Compress archived logs',
        },
      },
    },
  },
  {
    name: 'fractary_logs_list',
    description: 'List log entries',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['session', 'build', 'deployment', 'test', 'debug', 'audit', 'operational', 'workflow'],
          description: 'Filter by log type',
        },
        status: {
          type: 'string',
          enum: ['active', 'completed', 'stopped', 'success', 'failure', 'error'],
          description: 'Filter by log status',
        },
        issue_number: {
          type: 'number',
          description: 'Filter by issue number',
        },
        since: {
          type: 'string',
          description: 'Start date (ISO 8601 format)',
        },
        until: {
          type: 'string',
          description: 'End date (ISO 8601 format)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
        },
      },
    },
  },
  {
    name: 'fractary_logs_read',
    description: 'Read a specific log entry',
    inputSchema: {
      type: 'object',
      required: ['log_id'],
      properties: {
        log_id: {
          type: 'string',
          description: 'Log entry ID or path',
        },
      },
    },
  },
];
