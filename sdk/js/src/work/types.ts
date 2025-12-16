/**
 * @fractary/faber - Work Module Types
 *
 * Re-exports from main types + work-specific interfaces.
 */

// Import and re-export common types
import type {
  WorkConfig,
  WorkPlatform,
  Issue,
  IssueCreateOptions,
  IssueUpdateOptions,
  IssueFilters,
  WorkType,
  Label,
  Milestone,
  MilestoneCreateOptions,
  Comment,
  CommentCreateOptions,
  FaberContext,
} from '../common/types';

export type {
  WorkConfig,
  WorkPlatform,
  Issue,
  IssueCreateOptions,
  IssueUpdateOptions,
  IssueFilters,
  WorkType,
  Label,
  Milestone,
  MilestoneCreateOptions,
  Comment,
  CommentCreateOptions,
  FaberContext,
};

/**
 * Interface for work tracking providers
 */
export interface WorkProvider {
  readonly platform: 'github' | 'jira' | 'linear';

  // Issues
  createIssue(options: IssueCreateOptions): Promise<Issue>;
  fetchIssue(issueId: string | number): Promise<Issue>;
  updateIssue(
    issueId: string | number,
    options: IssueUpdateOptions
  ): Promise<Issue>;
  closeIssue(issueId: string | number): Promise<Issue>;
  reopenIssue(issueId: string | number): Promise<Issue>;
  searchIssues(
    query: string,
    filters?: IssueFilters
  ): Promise<Issue[]>;
  assignIssue(
    issueId: string | number,
    assignee: string
  ): Promise<Issue>;
  unassignIssue(issueId: string | number): Promise<Issue>;

  // Comments
  createComment(
    issueId: string | number,
    body: string,
    faberContext?: FaberContext
  ): Promise<Comment>;
  listComments(
    issueId: string | number,
    options?: { limit?: number; since?: string }
  ): Promise<Comment[]>;

  // Labels
  addLabels(issueId: string | number, labels: string[]): Promise<Label[]>;
  removeLabels(issueId: string | number, labels: string[]): Promise<void>;
  setLabels(issueId: string | number, labels: string[]): Promise<Label[]>;
  listLabels(issueId?: string | number): Promise<Label[]>;

  // Milestones
  createMilestone(
    options: MilestoneCreateOptions
  ): Promise<Milestone>;
  setMilestone(issueId: string | number, milestone: string): Promise<Issue>;
  removeMilestone(issueId: string | number): Promise<Issue>;
  listMilestones(state?: 'open' | 'closed' | 'all'): Promise<Milestone[]>;
}

/**
 * List options for comments
 */
export interface ListCommentsOptions {
  limit?: number;
  since?: string;
}
