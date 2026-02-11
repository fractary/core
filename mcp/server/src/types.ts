/**
 * Shared types for the MCP server
 * Re-exports common types from the SDK and defines MCP-specific types
 */

// Re-export SDK types for convenience
export type {
  Issue,
  IssueCreateOptions,
  IssueUpdateOptions,
  IssueFilters,
  Comment,
  Label,
  Milestone,
  MilestoneCreateOptions,
  WorkType,
  WorkPlatform,
  FaberContext,
} from '@fractary/core/work';

export type {
  Branch,
  BranchCreateOptions,
  BranchDeleteOptions,
  BranchListOptions,
  Commit,
  CommitOptions,
  CommitListOptions,
  DiffOptions,
  GitStatus,
  PullRequest,
  PRCreateOptions,
  PRUpdateOptions,
  PRMergeOptions,
  PRListOptions,
  PRReviewOptions,
  PushOptions,
  PullOptions,
  Tag,
  TagCreateOptions,
  TagListOptions,
  Worktree,
  WorktreeCreateOptions,
  WorktreeCleanupOptions,
  WorktreeCleanupResult,
} from '@fractary/core/repo';

export type {
  LogEntry,
  LogWriteOptions,
  LogAppendOptions,
  LogListOptions,
  LogSearchOptions,
  LogSearchResult,
  LogStatus,
  CaptureStartOptions,
  CaptureResult,
  CaptureSession,
  ArchiveResult,
} from '@fractary/core/logs';

export type {
  Doc,
  DocMetadata,
  DocFormat,
  DocSearchQuery,
} from '@fractary/core/docs';

// MCP-specific types
export interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
  items?: {
    type: string;
  };
}

export interface ToolInputSchema {
  type: 'object';
  required?: string[];
  properties: Record<string, ToolParameter>;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
}
