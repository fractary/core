import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP tool definitions for the File module
 * 7 tools for file storage operations
 */
export const fileTools: Tool[] = [
  {
    name: 'fractary_file_read',
    description: 'Read a file',
    inputSchema: {
      type: 'object',
      required: ['path'],
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file to read',
        },
        encoding: {
          type: 'string',
          description: 'File encoding (default: utf-8)',
        },
      },
    },
  },
  {
    name: 'fractary_file_write',
    description: 'Write content to a file',
    inputSchema: {
      type: 'object',
      required: ['path', 'content'],
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file to write',
        },
        content: {
          type: 'string',
          description: 'Content to write',
        },
        encoding: {
          type: 'string',
          description: 'File encoding (default: utf-8)',
        },
        overwrite: {
          type: 'boolean',
          description: 'Whether to overwrite if file exists',
        },
      },
    },
  },
  {
    name: 'fractary_file_list',
    description: 'List files in a directory',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Directory path to list',
        },
        pattern: {
          type: 'string',
          description: 'Glob pattern to filter files',
        },
        recursive: {
          type: 'boolean',
          description: 'Whether to list recursively',
        },
      },
    },
  },
  {
    name: 'fractary_file_delete',
    description: 'Delete a file',
    inputSchema: {
      type: 'object',
      required: ['path'],
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file to delete',
        },
      },
    },
  },
  {
    name: 'fractary_file_exists',
    description: 'Check if a file exists',
    inputSchema: {
      type: 'object',
      required: ['path'],
      properties: {
        path: {
          type: 'string',
          description: 'Path to check',
        },
      },
    },
  },
  {
    name: 'fractary_file_copy',
    description: 'Copy a file',
    inputSchema: {
      type: 'object',
      required: ['source', 'destination'],
      properties: {
        source: {
          type: 'string',
          description: 'Source file path',
        },
        destination: {
          type: 'string',
          description: 'Destination file path',
        },
        overwrite: {
          type: 'boolean',
          description: 'Whether to overwrite if destination exists',
        },
      },
    },
  },
  {
    name: 'fractary_file_move',
    description: 'Move a file',
    inputSchema: {
      type: 'object',
      required: ['source', 'destination'],
      properties: {
        source: {
          type: 'string',
          description: 'Source file path',
        },
        destination: {
          type: 'string',
          description: 'Destination file path',
        },
        overwrite: {
          type: 'boolean',
          description: 'Whether to overwrite if destination exists',
        },
      },
    },
  },
];
