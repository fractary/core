import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP tool definitions for the Work module
 * 19 tools for work tracking (issues, comments, labels, milestones)
 */
export const workTools: Tool[] = [
  {
    name: 'fractary_work_issue_fetch',
    description: 'Fetch details of a work item (issue, ticket, task) from the configured work tracker',
    inputSchema: {
      type: 'object',
      required: ['issue_number'],
      properties: {
        issue_number: {
          type: 'string',
          description: 'Issue number or ID to fetch',
        },
      },
    },
  },
  {
    name: 'fractary_work_issue_create',
    description: 'Create a new work item (issue, ticket, task) in the configured work tracker',
    inputSchema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: {
          type: 'string',
          description: 'Title of the issue',
        },
        body: {
          type: 'string',
          description: 'Body/description of the issue',
        },
        type: {
          type: 'string',
          enum: ['feature', 'bug', 'chore', 'task'],
          description: 'Type of work item',
        },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Labels to apply',
        },
        assignee: {
          type: 'string',
          description: 'User to assign the issue to',
        },
        milestone: {
          type: 'string',
          description: 'Milestone to associate with',
        },
      },
    },
  },
  {
    name: 'fractary_work_issue_update',
    description: 'Update a work item',
    inputSchema: {
      type: 'object',
      required: ['issue_number'],
      properties: {
        issue_number: {
          type: 'string',
          description: 'Issue number or ID to update',
        },
        title: {
          type: 'string',
          description: 'New title',
        },
        body: {
          type: 'string',
          description: 'New body/description',
        },
        state: {
          type: 'string',
          enum: ['open', 'closed'],
          description: 'New state',
        },
      },
    },
  },
  {
    name: 'fractary_work_issue_assign',
    description: 'Assign an issue to a user',
    inputSchema: {
      type: 'object',
      required: ['issue_number', 'assignee'],
      properties: {
        issue_number: {
          type: 'string',
          description: 'Issue number or ID',
        },
        assignee: {
          type: 'string',
          description: 'Username to assign to',
        },
      },
    },
  },
  {
    name: 'fractary_work_issue_unassign',
    description: 'Remove assignee from an issue',
    inputSchema: {
      type: 'object',
      required: ['issue_number'],
      properties: {
        issue_number: {
          type: 'string',
          description: 'Issue number or ID',
        },
      },
    },
  },
  {
    name: 'fractary_work_issue_close',
    description: 'Close an issue',
    inputSchema: {
      type: 'object',
      required: ['issue_number'],
      properties: {
        issue_number: {
          type: 'string',
          description: 'Issue number or ID',
        },
        comment: {
          type: 'string',
          description: 'Optional closing comment',
        },
      },
    },
  },
  {
    name: 'fractary_work_issue_reopen',
    description: 'Reopen a closed issue',
    inputSchema: {
      type: 'object',
      required: ['issue_number'],
      properties: {
        issue_number: {
          type: 'string',
          description: 'Issue number or ID',
        },
        comment: {
          type: 'string',
          description: 'Optional reopening comment',
        },
      },
    },
  },
  {
    name: 'fractary_work_issue_search',
    description: 'Search issues',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        state: {
          type: 'string',
          enum: ['open', 'closed', 'all'],
          description: 'Filter by state',
        },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by labels',
        },
        assignee: {
          type: 'string',
          description: 'Filter by assignee',
        },
        milestone: {
          type: 'string',
          description: 'Filter by milestone',
        },
        since: {
          type: 'string',
          description: 'Filter by creation date (ISO 8601 format)',
        },
      },
    },
  },
  {
    name: 'fractary_work_issue_classify',
    description: 'Classify the work type of an issue',
    inputSchema: {
      type: 'object',
      required: ['issue_number'],
      properties: {
        issue_number: {
          type: 'string',
          description: 'Issue number or ID',
        },
      },
    },
  },
  {
    name: 'fractary_work_comment_create',
    description: 'Add a comment to an issue',
    inputSchema: {
      type: 'object',
      required: ['issue_number', 'body'],
      properties: {
        issue_number: {
          type: 'string',
          description: 'Issue number or ID',
        },
        body: {
          type: 'string',
          description: 'Comment text',
        },
        faber_context: {
          type: 'string',
          enum: ['frame', 'architect', 'build', 'evaluate', 'release'],
          description: 'FABER workflow context',
        },
      },
    },
  },
  {
    name: 'fractary_work_comment_list',
    description: 'List comments on an issue',
    inputSchema: {
      type: 'object',
      required: ['issue_number'],
      properties: {
        issue_number: {
          type: 'string',
          description: 'Issue number or ID',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of comments',
        },
        since: {
          type: 'string',
          description: 'Only comments after this date (ISO 8601)',
        },
      },
    },
  },
  {
    name: 'fractary_work_label_add',
    description: 'Add labels to an issue',
    inputSchema: {
      type: 'object',
      required: ['issue_number', 'labels'],
      properties: {
        issue_number: {
          type: 'string',
          description: 'Issue number or ID',
        },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Labels to add',
        },
      },
    },
  },
  {
    name: 'fractary_work_label_remove',
    description: 'Remove labels from an issue',
    inputSchema: {
      type: 'object',
      required: ['issue_number', 'labels'],
      properties: {
        issue_number: {
          type: 'string',
          description: 'Issue number or ID',
        },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Labels to remove',
        },
      },
    },
  },
  {
    name: 'fractary_work_label_set',
    description: 'Set labels on an issue (replace all existing labels)',
    inputSchema: {
      type: 'object',
      required: ['issue_number', 'labels'],
      properties: {
        issue_number: {
          type: 'string',
          description: 'Issue number or ID',
        },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Labels to set',
        },
      },
    },
  },
  {
    name: 'fractary_work_label_list',
    description: 'List labels',
    inputSchema: {
      type: 'object',
      properties: {
        issue_number: {
          type: 'string',
          description: 'Optional: List labels for specific issue',
        },
      },
    },
  },
  {
    name: 'fractary_work_milestone_create',
    description: 'Create a milestone',
    inputSchema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: {
          type: 'string',
          description: 'Milestone title',
        },
        description: {
          type: 'string',
          description: 'Milestone description',
        },
        due_on: {
          type: 'string',
          description: 'Due date (ISO 8601 format)',
        },
      },
    },
  },
  {
    name: 'fractary_work_milestone_list',
    description: 'List milestones',
    inputSchema: {
      type: 'object',
      properties: {
        state: {
          type: 'string',
          enum: ['open', 'closed', 'all'],
          description: 'Filter by state',
        },
      },
    },
  },
  {
    name: 'fractary_work_milestone_set',
    description: 'Set milestone on an issue',
    inputSchema: {
      type: 'object',
      required: ['issue_number', 'milestone'],
      properties: {
        issue_number: {
          type: 'string',
          description: 'Issue number or ID',
        },
        milestone: {
          type: 'string',
          description: 'Milestone title',
        },
      },
    },
  },
  {
    name: 'fractary_work_milestone_remove',
    description: 'Remove milestone from an issue',
    inputSchema: {
      type: 'object',
      required: ['issue_number'],
      properties: {
        issue_number: {
          type: 'string',
          description: 'Issue number or ID',
        },
      },
    },
  },
];
