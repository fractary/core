import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP tool definitions for the Spec module
 * 5 tools for specification management
 */
export const specTools: Tool[] = [
  {
    name: 'fractary_spec_create',
    description: 'Create a new specification document',
    inputSchema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: {
          type: 'string',
          description: 'Title of the specification',
        },
        template: {
          type: 'string',
          enum: ['basic', 'feature', 'bug', 'infrastructure', 'api'],
          description: 'Template type for the specification',
        },
        work_id: {
          type: 'string',
          description: 'Work item ID to link to this spec',
        },
        context: {
          type: 'string',
          description: 'Context or background information for the specification',
        },
      },
    },
  },
  {
    name: 'fractary_spec_validate',
    description: 'Validate a specification document',
    inputSchema: {
      type: 'object',
      required: ['spec_id'],
      properties: {
        spec_id: {
          type: 'string',
          description: 'Specification ID or path to validate',
        },
      },
    },
  },
  {
    name: 'fractary_spec_refine',
    description: 'Refine a specification with feedback',
    inputSchema: {
      type: 'object',
      required: ['spec_id'],
      properties: {
        spec_id: {
          type: 'string',
          description: 'Specification ID or path to refine',
        },
        feedback: {
          type: 'string',
          description: 'Feedback or refinement instructions',
        },
      },
    },
  },
  {
    name: 'fractary_spec_list',
    description: 'List specification documents',
    inputSchema: {
      type: 'object',
      properties: {
        work_id: {
          type: 'string',
          description: 'Filter by work item ID',
        },
        status: {
          type: 'string',
          description: 'Filter by specification status',
        },
        template: {
          type: 'string',
          enum: ['basic', 'feature', 'bug', 'infrastructure', 'api'],
          description: 'Filter by template type',
        },
      },
    },
  },
  {
    name: 'fractary_spec_read',
    description: 'Read a specification document',
    inputSchema: {
      type: 'object',
      required: ['spec_id'],
      properties: {
        spec_id: {
          type: 'string',
          description: 'Specification ID or path to read',
        },
      },
    },
  },
];
