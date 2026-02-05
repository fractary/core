/**
 * @fractary/faber - WorkManager
 *
 * Main entry point for work tracking operations.
 * Supports GitHub Issues, Jira, and Linear.
 */

import {
  WorkConfig,
  Issue,
  IssueCreateOptions,
  IssueUpdateOptions,
  IssueFilters,
  WorkType,
  ClassifyResult,
  Comment,
  Label,
  Milestone,
  MilestoneCreateOptions,
  FaberContext,
} from '../common/types';
import { WorkProvider, ListCommentsOptions } from './types';
import { loadWorkConfig, findProjectRoot } from '../common/config';
import { ConfigurationError } from '../common/errors';
import { GitHubWorkProvider } from './providers/github';
import { JiraWorkProvider } from './providers/jira';
import { LinearWorkProvider } from './providers/linear';

/**
 * WorkManager - Unified work tracking across platforms
 *
 * @example
 * ```typescript
 * const work = new WorkManager();
 * const issue = await work.fetchIssue(123);
 * await work.createComment(123, 'Implementation complete');
 * ```
 */
export class WorkManager {
  private provider: WorkProvider;
  private config: WorkConfig;

  constructor(config?: WorkConfig) {
    this.config = config || this.loadConfig();
    this.provider = this.createProvider(this.config);
  }

  /**
   * Load work configuration from project
   */
  private loadConfig(): WorkConfig {
    const config = loadWorkConfig(findProjectRoot());
    if (!config) {
      throw new ConfigurationError(
        'Work configuration not found. Run "fractary work init" to set up.'
      );
    }
    return config;
  }

  /**
   * Create the appropriate provider based on config
   */
  private createProvider(config: WorkConfig): WorkProvider {
    switch (config.platform) {
      case 'github':
        return new GitHubWorkProvider(config);
      case 'jira':
        return new JiraWorkProvider(config);
      case 'linear':
        return new LinearWorkProvider(config);
      default:
        throw new ConfigurationError(
          `Unsupported work platform: ${config.platform}`
        );
    }
  }

  /**
   * Get the current platform
   */
  getPlatform(): string {
    return this.provider.platform;
  }

  // =========================================================================
  // ISSUES
  // =========================================================================

  /**
   * Create a new issue
   */
  async createIssue(options: IssueCreateOptions): Promise<Issue> {
    return this.provider.createIssue(options);
  }

  /**
   * Fetch an issue by ID
   */
  async fetchIssue(issueId: string | number): Promise<Issue> {
    return this.provider.fetchIssue(issueId);
  }

  /**
   * Update an existing issue
   */
  async updateIssue(
    issueId: string | number,
    options: IssueUpdateOptions
  ): Promise<Issue> {
    return this.provider.updateIssue(issueId, options);
  }

  /**
   * Close an issue
   */
  async closeIssue(issueId: string | number): Promise<Issue> {
    return this.provider.closeIssue(issueId);
  }

  /**
   * Reopen a closed issue
   */
  async reopenIssue(issueId: string | number): Promise<Issue> {
    return this.provider.reopenIssue(issueId);
  }

  /**
   * Search for issues
   */
  async searchIssues(
    query: string,
    filters?: IssueFilters
  ): Promise<Issue[]> {
    return this.provider.searchIssues(query, filters);
  }

  /**
   * Assign an issue to a user
   */
  async assignIssue(
    issueId: string | number,
    assignee: string
  ): Promise<Issue> {
    return this.provider.assignIssue(issueId, assignee);
  }

  /**
   * Unassign an issue
   */
  async unassignIssue(issueId: string | number): Promise<Issue> {
    return this.provider.unassignIssue(issueId);
  }

  // =========================================================================
  // COMMENTS
  // =========================================================================

  /**
   * Create a comment on an issue
   */
  async createComment(
    issueId: string | number,
    body: string,
    faberContext?: FaberContext
  ): Promise<Comment> {
    return this.provider.createComment(issueId, body, faberContext);
  }

  /**
   * List comments on an issue
   */
  async listComments(
    issueId: string | number,
    options?: ListCommentsOptions
  ): Promise<Comment[]> {
    return this.provider.listComments(issueId, options);
  }

  // =========================================================================
  // LABELS
  // =========================================================================

  /**
   * Add labels to an issue
   */
  async addLabels(
    issueId: string | number,
    labels: string[]
  ): Promise<Label[]> {
    return this.provider.addLabels(issueId, labels);
  }

  /**
   * Remove labels from an issue
   */
  async removeLabels(
    issueId: string | number,
    labels: string[]
  ): Promise<void> {
    return this.provider.removeLabels(issueId, labels);
  }

  /**
   * Set labels on an issue (replaces existing)
   */
  async setLabels(
    issueId: string | number,
    labels: string[]
  ): Promise<Label[]> {
    return this.provider.setLabels(issueId, labels);
  }

  /**
   * List all labels (or labels on an issue)
   */
  async listLabels(issueId?: string | number): Promise<Label[]> {
    return this.provider.listLabels(issueId);
  }

  // =========================================================================
  // MILESTONES
  // =========================================================================

  /**
   * Create a new milestone
   */
  async createMilestone(
    options: MilestoneCreateOptions
  ): Promise<Milestone> {
    return this.provider.createMilestone(options);
  }

  /**
   * Set milestone on an issue
   */
  async setMilestone(
    issueId: string | number,
    milestone: string
  ): Promise<Issue> {
    return this.provider.setMilestone(issueId, milestone);
  }

  /**
   * Remove milestone from an issue
   */
  async removeMilestone(issueId: string | number): Promise<Issue> {
    return this.provider.removeMilestone(issueId);
  }

  /**
   * List all milestones
   */
  async listMilestones(
    state?: 'open' | 'closed' | 'all'
  ): Promise<Milestone[]> {
    return this.provider.listMilestones(state);
  }

  // =========================================================================
  // CLASSIFICATION
  // =========================================================================

  /**
   * Label-based scoring configuration for classification
   */
  private static readonly LABEL_SCORES: Record<string, { type: WorkType; score: number }> = {
    bug: { type: 'bug', score: 0.95 },
    defect: { type: 'bug', score: 0.95 },
    regression: { type: 'bug', score: 0.9 },
    enhancement: { type: 'feature', score: 0.9 },
    feature: { type: 'feature', score: 0.95 },
    'new feature': { type: 'feature', score: 0.95 },
    chore: { type: 'chore', score: 0.9 },
    maintenance: { type: 'chore', score: 0.85 },
    dependencies: { type: 'chore', score: 0.8 },
    hotfix: { type: 'patch', score: 0.95 },
    urgent: { type: 'patch', score: 0.7 },
    security: { type: 'patch', score: 0.85 },
    critical: { type: 'patch', score: 0.8 },
    infrastructure: { type: 'infrastructure', score: 0.9 },
    infra: { type: 'infrastructure', score: 0.9 },
    api: { type: 'api', score: 0.9 },
  };

  /**
   * Keyword groups for title-based classification
   */
  private static readonly KEYWORDS = {
    bug: ['fix', 'bug', 'error', 'crash', 'broken', 'issue', 'problem'],
    feature: ['add', 'implement', 'new', 'create', 'feature', 'support'],
    chore: ['update', 'upgrade', 'refactor', 'clean', 'remove', 'deprecate', 'migrate'],
    patch: ['hotfix', 'urgent', 'critical', 'security'],
  };

  /**
   * Classify the type of work based on issue metadata with confidence scoring
   *
   * Uses a multi-signal approach:
   * 1. Labels (highest priority) - direct mapping with high confidence
   * 2. Title keywords - pattern matching with moderate confidence
   *
   * @param issue - The issue to classify
   * @returns Classification result with work type, confidence score, and signals
   */
  classifyWorkType(issue: Issue): ClassifyResult {
    const title = (issue.title || '').toLowerCase();
    const labels = (issue.labels || []).map((l) => l.name.toLowerCase());

    const signals = {
      labels: labels,
      title_keywords: [] as string[],
      has_bug_markers: false,
    };

    // Check labels first (highest priority)
    for (const label of labels) {
      const match = WorkManager.LABEL_SCORES[label];
      if (match) {
        return {
          work_type: match.type,
          confidence: match.score,
          signals,
        };
      }
    }

    // Check for patch markers (highest urgency)
    for (const keyword of WorkManager.KEYWORDS.patch) {
      if (title.includes(keyword)) {
        signals.title_keywords.push(keyword);
        return {
          work_type: 'patch',
          confidence: 0.85,
          signals,
        };
      }
    }

    // Check for bug markers
    for (const keyword of WorkManager.KEYWORDS.bug) {
      if (title.includes(keyword)) {
        signals.title_keywords.push(keyword);
        signals.has_bug_markers = true;
        return {
          work_type: 'bug',
          confidence: 0.75,
          signals,
        };
      }
    }

    // Check for chore markers
    for (const keyword of WorkManager.KEYWORDS.chore) {
      if (title.includes(keyword)) {
        signals.title_keywords.push(keyword);
        return {
          work_type: 'chore',
          confidence: 0.65,
          signals,
        };
      }
    }

    // Check for feature markers
    for (const keyword of WorkManager.KEYWORDS.feature) {
      if (title.includes(keyword)) {
        signals.title_keywords.push(keyword);
        return {
          work_type: 'feature',
          confidence: 0.7,
          signals,
        };
      }
    }

    // Default to feature with low confidence
    return {
      work_type: 'feature',
      confidence: 0.5,
      signals,
    };
  }
}
