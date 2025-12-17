import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP tool definitions for the Docs module
 * 7 tools for documentation management
 */
export const docsTools: Tool[] = [
  {
    name: 'fractary_docs_create',
    description: 'Create documentation',
    inputSchema: {
      type: 'object',
      required: ['id', 'title', 'content'],
      properties: {
        id: {
          type: 'string',
          description: 'Document ID',
        },
        title: {
          type: 'string',
          description: 'Document title',
        },
        content: {
          type: 'string',
          description: 'Document content',
        },
        type: {
          type: 'string',
          description: 'Document type',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Document tags',
        },
      },
    },
  },
  {
    name: 'fractary_docs_update',
    description: 'Update documentation',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          description: 'Document ID',
        },
        title: {
          type: 'string',
          description: 'New document title',
        },
        content: {
          type: 'string',
          description: 'New document content',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'New document tags',
        },
      },
    },
  },
  {
    name: 'fractary_docs_search',
    description: 'Search documentation',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Search text',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by tags',
        },
        author: {
          type: 'string',
          description: 'Filter by author',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
        },
      },
    },
  },
  {
    name: 'fractary_docs_export',
    description: 'Export documentation',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          description: 'Document ID',
        },
        format: {
          type: 'string',
          enum: ['markdown', 'html', 'pdf'],
          description: 'Export format',
        },
      },
    },
  },
  {
    name: 'fractary_docs_list',
    description: 'List documentation',
    inputSchema: {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by tags',
        },
        author: {
          type: 'string',
          description: 'Filter by author',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
        },
      },
    },
  },
  {
    name: 'fractary_docs_read',
    description: 'Read documentation content',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          description: 'Document ID',
        },
      },
    },
  },
  {
    name: 'fractary_docs_delete',
    description: 'Delete documentation',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          description: 'Document ID',
        },
      },
    },
  },
];
