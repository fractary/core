import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP tool definitions for the Repo module
 * 37 tools for repository management (Git, PRs, branches, tags, worktrees)
 */
export const repoTools: Tool[] = [
  // Repository status
  {
    name: 'fractary_repo_status',
    description: 'Get repository status',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'fractary_repo_branch_current',
    description: 'Get current branch name',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'fractary_repo_is_dirty',
    description: 'Check if repository has uncommitted changes',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'fractary_repo_diff',
    description: 'Get diff of changes',
    inputSchema: {
      type: 'object',
      properties: {
        staged: {
          type: 'boolean',
          description: 'Show only staged changes',
        },
        base: {
          type: 'string',
          description: 'Base branch/commit for comparison',
        },
        head: {
          type: 'string',
          description: 'Head branch/commit for comparison',
        },
      },
    },
  },

  // Branch operations
  {
    name: 'fractary_repo_branch_create',
    description: 'Create a new branch',
    inputSchema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          description: 'Branch name',
        },
        base_branch: {
          type: 'string',
          description: 'Base branch to create from',
        },
        from_protected: {
          type: 'boolean',
          description: 'Allow creating from protected branch',
        },
      },
    },
  },
  {
    name: 'fractary_repo_branch_delete',
    description: 'Delete a branch',
    inputSchema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          description: 'Branch name to delete',
        },
        force: {
          type: 'boolean',
          description: 'Force delete unmerged branch',
        },
        location: {
          type: 'string',
          enum: ['local', 'remote', 'both'],
          description: 'Where to delete the branch',
        },
      },
    },
  },
  {
    name: 'fractary_repo_branch_list',
    description: 'List branches',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Pattern to filter branches',
        },
        merged: {
          type: 'boolean',
          description: 'Only show merged branches',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of branches',
        },
      },
    },
  },
  {
    name: 'fractary_repo_branch_get',
    description: 'Get branch details',
    inputSchema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          description: 'Branch name',
        },
      },
    },
  },
  {
    name: 'fractary_repo_checkout',
    description: 'Checkout a branch',
    inputSchema: {
      type: 'object',
      required: ['branch'],
      properties: {
        branch: {
          type: 'string',
          description: 'Branch name to checkout',
        },
      },
    },
  },
  {
    name: 'fractary_repo_branch_name_generate',
    description: 'Generate a semantic branch name',
    inputSchema: {
      type: 'object',
      required: ['type', 'description'],
      properties: {
        type: {
          type: 'string',
          enum: ['feature', 'fix', 'chore', 'docs'],
          description: 'Branch type',
        },
        description: {
          type: 'string',
          description: 'Brief description',
        },
        work_id: {
          type: 'string',
          description: 'Work item ID',
        },
      },
    },
  },

  // Staging
  {
    name: 'fractary_repo_stage',
    description: 'Stage files for commit',
    inputSchema: {
      type: 'object',
      required: ['patterns'],
      properties: {
        patterns: {
          type: 'array',
          items: { type: 'string' },
          description: 'File patterns to stage',
        },
      },
    },
  },
  {
    name: 'fractary_repo_stage_all',
    description: 'Stage all changes',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'fractary_repo_unstage',
    description: 'Unstage files',
    inputSchema: {
      type: 'object',
      required: ['patterns'],
      properties: {
        patterns: {
          type: 'array',
          items: { type: 'string' },
          description: 'File patterns to unstage',
        },
      },
    },
  },

  // Commits
  {
    name: 'fractary_repo_commit',
    description: 'Create a commit',
    inputSchema: {
      type: 'object',
      required: ['message'],
      properties: {
        message: {
          type: 'string',
          description: 'Commit message',
        },
        type: {
          type: 'string',
          enum: ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
          description: 'Conventional commit type',
        },
        scope: {
          type: 'string',
          description: 'Commit scope',
        },
        body: {
          type: 'string',
          description: 'Commit body/description',
        },
        breaking: {
          type: 'boolean',
          description: 'Mark as breaking change',
        },
        work_id: {
          type: 'string',
          description: 'Work item ID to link',
        },
      },
    },
  },
  {
    name: 'fractary_repo_commit_get',
    description: 'Get commit details',
    inputSchema: {
      type: 'object',
      required: ['ref'],
      properties: {
        ref: {
          type: 'string',
          description: 'Commit ref (SHA, HEAD, etc.)',
        },
      },
    },
  },
  {
    name: 'fractary_repo_commit_list',
    description: 'List commits',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of commits',
        },
        branch: {
          type: 'string',
          description: 'Branch to list commits from',
        },
        since: {
          type: 'string',
          description: 'Only commits after this date',
        },
        until: {
          type: 'string',
          description: 'Only commits before this date',
        },
        author: {
          type: 'string',
          description: 'Filter by commit author',
        },
      },
    },
  },

  // Push/Pull/Fetch
  {
    name: 'fractary_repo_push',
    description: 'Push to remote',
    inputSchema: {
      type: 'object',
      properties: {
        branch: {
          type: 'string',
          description: 'Branch to push',
        },
        remote: {
          type: 'string',
          description: 'Remote name',
        },
        force: {
          type: 'boolean',
          description: 'Force push',
        },
        set_upstream: {
          type: 'boolean',
          description: 'Set upstream tracking',
        },
      },
    },
  },
  {
    name: 'fractary_repo_pull',
    description: 'Pull from remote',
    inputSchema: {
      type: 'object',
      properties: {
        branch: {
          type: 'string',
          description: 'Branch to pull',
        },
        remote: {
          type: 'string',
          description: 'Remote name',
        },
        rebase: {
          type: 'boolean',
          description: 'Use rebase instead of merge',
        },
      },
    },
  },
  {
    name: 'fractary_repo_fetch',
    description: 'Fetch from remote',
    inputSchema: {
      type: 'object',
      properties: {
        remote: {
          type: 'string',
          description: 'Remote name',
        },
      },
    },
  },

  // Pull Requests
  {
    name: 'fractary_repo_pr_create',
    description: 'Create a pull request',
    inputSchema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: {
          type: 'string',
          description: 'PR title',
        },
        body: {
          type: 'string',
          description: 'PR description',
        },
        base: {
          type: 'string',
          description: 'Base branch',
        },
        head: {
          type: 'string',
          description: 'Head branch',
        },
        draft: {
          type: 'boolean',
          description: 'Create as draft',
        },
      },
    },
  },
  {
    name: 'fractary_repo_pr_get',
    description: 'Get PR details',
    inputSchema: {
      type: 'object',
      required: ['number'],
      properties: {
        number: {
          type: 'number',
          description: 'PR number',
        },
      },
    },
  },
  {
    name: 'fractary_repo_pr_update',
    description: 'Update a pull request',
    inputSchema: {
      type: 'object',
      required: ['number'],
      properties: {
        number: {
          type: 'number',
          description: 'PR number',
        },
        title: {
          type: 'string',
          description: 'New title',
        },
        body: {
          type: 'string',
          description: 'New description',
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
    name: 'fractary_repo_pr_comment',
    description: 'Comment on a pull request',
    inputSchema: {
      type: 'object',
      required: ['number', 'body'],
      properties: {
        number: {
          type: 'number',
          description: 'PR number',
        },
        body: {
          type: 'string',
          description: 'Comment text',
        },
      },
    },
  },
  {
    name: 'fractary_repo_pr_review',
    description: 'Review a pull request',
    inputSchema: {
      type: 'object',
      required: ['number', 'action'],
      properties: {
        number: {
          type: 'number',
          description: 'PR number',
        },
        action: {
          type: 'string',
          enum: ['approve', 'request_changes', 'comment'],
          description: 'Review action to perform',
        },
        comment: {
          type: 'string',
          description: 'Review comment',
        },
      },
    },
  },
  {
    name: 'fractary_repo_pr_request_review',
    description: 'Request reviewers for a PR',
    inputSchema: {
      type: 'object',
      required: ['number', 'reviewers'],
      properties: {
        number: {
          type: 'number',
          description: 'PR number',
        },
        reviewers: {
          type: 'array',
          items: { type: 'string' },
          description: 'Usernames of reviewers',
        },
      },
    },
  },
  {
    name: 'fractary_repo_pr_approve',
    description: 'Approve a pull request',
    inputSchema: {
      type: 'object',
      required: ['number'],
      properties: {
        number: {
          type: 'number',
          description: 'PR number',
        },
        comment: {
          type: 'string',
          description: 'Approval comment',
        },
      },
    },
  },
  {
    name: 'fractary_repo_pr_merge',
    description: 'Merge a pull request',
    inputSchema: {
      type: 'object',
      required: ['number'],
      properties: {
        number: {
          type: 'number',
          description: 'PR number',
        },
        strategy: {
          type: 'string',
          enum: ['merge', 'squash', 'rebase'],
          description: 'Merge strategy',
        },
        delete_branch: {
          type: 'boolean',
          description: 'Delete branch after merge',
        },
      },
    },
  },
  {
    name: 'fractary_repo_pr_list',
    description: 'List pull requests',
    inputSchema: {
      type: 'object',
      properties: {
        state: {
          type: 'string',
          enum: ['open', 'closed', 'all'],
          description: 'Filter by state',
        },
        author: {
          type: 'string',
          description: 'Filter by author',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of PRs',
        },
      },
    },
  },

  // Tags
  {
    name: 'fractary_repo_tag_create',
    description: 'Create a Git tag',
    inputSchema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          description: 'Tag name',
        },
        message: {
          type: 'string',
          description: 'Tag message (annotated tag)',
        },
        commit: {
          type: 'string',
          description: 'Commit to tag (default: HEAD)',
        },
      },
    },
  },
  {
    name: 'fractary_repo_tag_delete',
    description: 'Delete a Git tag',
    inputSchema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          description: 'Tag name',
        },
      },
    },
  },
  {
    name: 'fractary_repo_tag_push',
    description: 'Push a tag to remote',
    inputSchema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          description: 'Tag name',
        },
        remote: {
          type: 'string',
          description: 'Remote name',
        },
      },
    },
  },
  {
    name: 'fractary_repo_tag_list',
    description: 'List Git tags',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Pattern to filter tags',
        },
        latest: {
          type: 'number',
          description: 'Get only the latest N tags',
        },
      },
    },
  },

  // Worktrees
  {
    name: 'fractary_repo_worktree_create',
    description: 'Create a Git worktree',
    inputSchema: {
      type: 'object',
      required: ['path', 'branch'],
      properties: {
        path: {
          type: 'string',
          description: 'Worktree path',
        },
        branch: {
          type: 'string',
          description: 'Branch name',
        },
        base_branch: {
          type: 'string',
          description: 'Base branch to create from',
        },
      },
    },
  },
  {
    name: 'fractary_repo_worktree_list',
    description: 'List Git worktrees',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'fractary_repo_worktree_remove',
    description: 'Remove a Git worktree',
    inputSchema: {
      type: 'object',
      required: ['path'],
      properties: {
        path: {
          type: 'string',
          description: 'Worktree path',
        },
        force: {
          type: 'boolean',
          description: 'Force removal',
        },
      },
    },
  },
  {
    name: 'fractary_repo_worktree_prune',
    description: 'Prune stale worktrees',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'fractary_repo_worktree_cleanup',
    description: 'Cleanup worktrees',
    inputSchema: {
      type: 'object',
      properties: {
        merged: {
          type: 'boolean',
          description: 'Only clean merged worktrees',
        },
        force: {
          type: 'boolean',
          description: 'Force cleanup',
        },
        delete_branch: {
          type: 'boolean',
          description: 'Delete associated branches',
        },
      },
    },
  },
];
