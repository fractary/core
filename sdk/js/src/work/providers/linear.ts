/**
 * @fractary/core - Linear Work Provider
 *
 * ⚠️ STUB IMPLEMENTATION - NOT YET FUNCTIONAL
 *
 * This provider is included for future compatibility but is not currently implemented.
 * All methods will throw ProviderError when called.
 *
 * Use GitHubWorkProvider for a fully functional work tracking provider.
 *
 * Future implementation will include:
 * - Linear GraphQL API integration
 * - Issue creation and management
 * - Project and team support
 * - Cycle management
 */

import {
  WorkConfig,
  Issue,
  IssueCreateOptions,
  IssueUpdateOptions,
  IssueFilters,
  Comment,
  Label,
  Milestone,
  MilestoneCreateOptions,
  FaberContext,
} from '../../common/types';
import { WorkProvider } from '../types';
import { ProviderError } from '../../common/errors';

/**
 * Linear Issues provider
 *
 * Note: This is a stub implementation. Full Linear support requires:
 * - Linear GraphQL API integration
 * - Team/workspace configuration
 * - Cycle support (Linear's equivalent of milestones)
 * - Label management
 */
export class LinearWorkProvider implements WorkProvider {
  readonly platform = 'linear' as const;
  // Stored for future API implementation
  private teamId: string;

  constructor(config: WorkConfig) {
    if (!config.project) {
      throw new ProviderError(
        'linear',
        'init',
        'Linear work provider requires project (team_id) in config'
      );
    }
    this.teamId = config.project;
  }

  /** Get the team ID for API calls */
  protected getTeamId(): string {
    return this.teamId;
  }

  private notImplemented(operation: string): never {
    throw new ProviderError(
      'linear',
      operation,
      `Linear ${operation} not yet implemented`
    );
  }

  async createIssue(_options: IssueCreateOptions): Promise<Issue> {
    this.notImplemented('createIssue');
  }

  async fetchIssue(_issueId: string | number): Promise<Issue> {
    this.notImplemented('fetchIssue');
  }

  async updateIssue(
    _issueId: string | number,
    _options: IssueUpdateOptions
  ): Promise<Issue> {
    this.notImplemented('updateIssue');
  }

  async closeIssue(_issueId: string | number): Promise<Issue> {
    this.notImplemented('closeIssue');
  }

  async reopenIssue(_issueId: string | number): Promise<Issue> {
    this.notImplemented('reopenIssue');
  }

  async searchIssues(
    _query: string,
    _filters?: IssueFilters
  ): Promise<Issue[]> {
    this.notImplemented('searchIssues');
  }

  async assignIssue(
    _issueId: string | number,
    _assignee: string
  ): Promise<Issue> {
    this.notImplemented('assignIssue');
  }

  async unassignIssue(_issueId: string | number): Promise<Issue> {
    this.notImplemented('unassignIssue');
  }

  async createComment(
    _issueId: string | number,
    _body: string,
    _faberContext?: FaberContext
  ): Promise<Comment> {
    this.notImplemented('createComment');
  }

  async listComments(
    _issueId: string | number,
    _options?: { limit?: number; since?: string }
  ): Promise<Comment[]> {
    this.notImplemented('listComments');
  }

  async addLabels(
    _issueId: string | number,
    _labels: string[]
  ): Promise<Label[]> {
    this.notImplemented('addLabels');
  }

  async removeLabels(
    _issueId: string | number,
    _labels: string[]
  ): Promise<void> {
    this.notImplemented('removeLabels');
  }

  async setLabels(
    _issueId: string | number,
    _labels: string[]
  ): Promise<Label[]> {
    this.notImplemented('setLabels');
  }

  async listLabels(_issueId?: string | number): Promise<Label[]> {
    this.notImplemented('listLabels');
  }

  async createMilestone(
    _options: MilestoneCreateOptions
  ): Promise<Milestone> {
    this.notImplemented('createMilestone');
  }

  async setMilestone(
    _issueId: string | number,
    _milestone: string
  ): Promise<Issue> {
    this.notImplemented('setMilestone');
  }

  async removeMilestone(_issueId: string | number): Promise<Issue> {
    this.notImplemented('removeMilestone');
  }

  async listMilestones(
    _state?: 'open' | 'closed' | 'all'
  ): Promise<Milestone[]> {
    this.notImplemented('listMilestones');
  }
}
