/**
 * @fractary/faber - Repo Module Types
 *
 * Re-exports from main types + repo-specific interfaces.
 */

// Import and re-export common types
import type {
  RepoConfig,
  RepoPlatform,
  BranchPrefixConfig,
  Branch,
  BranchCreateOptions,
  BranchDeleteOptions,
  BranchListOptions,
  Commit,
  CommitType,
  CommitOptions,
  CommitListOptions,
  GitStatus,
  PullRequest,
  PRCreateOptions,
  PRUpdateOptions,
  PRListOptions,
  PRMergeStrategy,
  PRMergeOptions,
  PRReviewOptions,
  Tag,
  TagCreateOptions,
  TagListOptions,
  Worktree,
  WorktreeCreateOptions,
  WorktreeCleanupOptions,
  PushOptions,
  PullOptions,
} from '../common/types';

export type {
  RepoConfig,
  RepoPlatform,
  BranchPrefixConfig,
  Branch,
  BranchCreateOptions,
  BranchDeleteOptions,
  BranchListOptions,
  Commit,
  CommitType,
  CommitOptions,
  CommitListOptions,
  GitStatus,
  PullRequest,
  PRCreateOptions,
  PRUpdateOptions,
  PRListOptions,
  PRMergeStrategy,
  PRMergeOptions,
  PRReviewOptions,
  Tag,
  TagCreateOptions,
  TagListOptions,
  Worktree,
  WorktreeCreateOptions,
  WorktreeCleanupOptions,
  PushOptions,
  PullOptions,
};

/**
 * Interface for repository providers
 */
export interface RepoProvider {
  readonly platform: 'github' | 'gitlab' | 'bitbucket';

  // Branches
  createBranch(name: string, options?: BranchCreateOptions): Promise<Branch>;
  deleteBranch(name: string, options?: BranchDeleteOptions): Promise<void>;
  listBranches(options?: BranchListOptions): Promise<Branch[]>;
  getBranch(name: string): Promise<Branch | null>;

  // Pull Requests
  createPR(options: PRCreateOptions): Promise<PullRequest>;
  getPR(number: number): Promise<PullRequest>;
  updatePR(number: number, options: PRUpdateOptions): Promise<PullRequest>;
  listPRs(options?: PRListOptions): Promise<PullRequest[]>;
  mergePR(number: number, options?: PRMergeOptions): Promise<PullRequest>;
  addPRComment(number: number, body: string): Promise<void>;
  requestReview(number: number, reviewers: string[]): Promise<void>;
  approvePR(number: number, comment?: string): Promise<void>;
}

/**
 * Worktree cleanup result
 */
export interface WorktreeCleanupResult {
  removed: string[];
  skipped: Array<{ path: string; reason: string }>;
  errors: Array<{ path: string; error: string }>;
}

/**
 * Diff options
 */
export interface DiffOptions {
  staged?: boolean;
  base?: string;
  head?: string;
}
