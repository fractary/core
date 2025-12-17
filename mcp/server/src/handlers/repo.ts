import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { RepoManager } from '@fractary/core/repo';
import { Config } from '../config.js';
import { successResult, errorResult } from './helpers.js';

// ============================================================================
// Repository Status
// ============================================================================

export async function handleRepoStatus(
  _params: Record<string, never>,
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const status = manager.getStatus();
    return successResult(status);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error getting status: ${message}`);
  }
}

export async function handleRepoBranchCurrent(
  _params: Record<string, never>,
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const branch = manager.getCurrentBranch();
    return successResult({ branch });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error getting current branch: ${message}`);
  }
}

export async function handleRepoIsDirty(
  _params: Record<string, never>,
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const dirty = manager.isDirty();
    return successResult({ dirty });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error checking if dirty: ${message}`);
  }
}

export async function handleRepoDiff(
  params: {
    staged?: boolean;
    base?: string;
    head?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const diff = manager.getDiff({
      staged: params.staged,
      base: params.base,
      head: params.head,
    });
    return successResult({ diff });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error getting diff: ${message}`);
  }
}

// ============================================================================
// Branch Operations
// ============================================================================

export async function handleRepoBranchCreate(
  params: {
    name: string;
    base_branch?: string;
    from_protected?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const branch = await manager.createBranch(params.name, {
      baseBranch: params.base_branch,
      fromProtected: params.from_protected,
    });
    return successResult(branch);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error creating branch: ${message}`);
  }
}

export async function handleRepoBranchDelete(
  params: {
    name: string;
    force?: boolean;
    location?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    await manager.deleteBranch(params.name, {
      force: params.force,
      location: params.location as 'local' | 'remote' | 'both' | undefined,
    });
    return successResult({ deleted: true, branch: params.name });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error deleting branch: ${message}`);
  }
}

export async function handleRepoBranchList(
  params: {
    pattern?: string;
    merged?: boolean;
    limit?: number;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const branches = await manager.listBranches({
      pattern: params.pattern,
      merged: params.merged,
      limit: params.limit,
    });
    return successResult(branches);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error listing branches: ${message}`);
  }
}

export async function handleRepoBranchGet(
  params: { name: string },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const branch = await manager.getBranch(params.name);

    if (!branch) {
      return errorResult(`Branch not found: ${params.name}`);
    }

    return successResult(branch);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error getting branch: ${message}`);
  }
}

export async function handleRepoCheckout(
  params: { branch: string },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    manager.checkout(params.branch);
    return successResult({ checked_out: params.branch });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error checking out branch: ${message}`);
  }
}

export async function handleRepoBranchNameGenerate(
  params: {
    type: string;
    description: string;
    work_id?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const name = manager.generateBranchName({
      type: params.type as 'feature' | 'fix' | 'chore' | 'docs',
      description: params.description,
      workId: params.work_id,
    });
    return successResult({ name });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error generating branch name: ${message}`);
  }
}

// ============================================================================
// Staging
// ============================================================================

export async function handleRepoStage(
  params: { patterns: string[] },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    manager.stage(params.patterns);
    return successResult({ staged: params.patterns });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error staging files: ${message}`);
  }
}

export async function handleRepoStageAll(
  _params: Record<string, never>,
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    manager.stageAll();
    return successResult({ staged_all: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error staging all files: ${message}`);
  }
}

export async function handleRepoUnstage(
  params: { patterns: string[] },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    manager.unstage(params.patterns);
    return successResult({ unstaged: params.patterns });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error unstaging files: ${message}`);
  }
}

// ============================================================================
// Commits
// ============================================================================

export async function handleRepoCommit(
  params: {
    message: string;
    type?: string;
    scope?: string;
    body?: string;
    breaking?: boolean;
    work_id?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const commit = manager.commit({
      message: params.message,
      type: params.type as 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore' | undefined,
      scope: params.scope,
      body: params.body,
      breaking: params.breaking,
      workId: params.work_id,
    });
    return successResult(commit);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error creating commit: ${message}`);
  }
}

export async function handleRepoCommitGet(
  params: { ref: string },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const commit = manager.getCommit(params.ref);
    return successResult(commit);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error getting commit: ${message}`);
  }
}

export async function handleRepoCommitList(
  params: {
    limit?: number;
    branch?: string;
    since?: string;
    until?: string;
    author?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const commits = manager.listCommits({
      limit: params.limit,
      branch: params.branch,
      since: params.since,
      until: params.until,
      author: params.author,
    });
    return successResult(commits);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error listing commits: ${message}`);
  }
}

// ============================================================================
// Push/Pull/Fetch
// ============================================================================

export async function handleRepoPush(
  params: {
    branch?: string;
    remote?: string;
    force?: boolean;
    set_upstream?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    manager.push({
      branch: params.branch,
      remote: params.remote,
      force: params.force,
      setUpstream: params.set_upstream,
    });
    return successResult({ pushed: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error pushing: ${message}`);
  }
}

export async function handleRepoPull(
  params: {
    branch?: string;
    remote?: string;
    rebase?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    manager.pull({
      branch: params.branch,
      remote: params.remote,
      rebase: params.rebase,
    });
    return successResult({ pulled: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error pulling: ${message}`);
  }
}

export async function handleRepoFetch(
  params: { remote?: string },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    manager.fetch(params.remote);
    return successResult({ fetched: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error fetching: ${message}`);
  }
}

// ============================================================================
// Pull Requests
// ============================================================================

export async function handleRepoPrCreate(
  params: {
    title: string;
    body?: string;
    base?: string;
    head?: string;
    draft?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const pr = await manager.createPR({
      title: params.title,
      body: params.body,
      base: params.base,
      head: params.head,
      draft: params.draft,
    });
    return successResult(pr);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error creating PR: ${message}`);
  }
}

export async function handleRepoPrGet(
  params: { number: number },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const pr = await manager.getPR(params.number);
    return successResult(pr);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error getting PR: ${message}`);
  }
}

export async function handleRepoPrUpdate(
  params: {
    number: number;
    title?: string;
    body?: string;
    state?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const pr = await manager.updatePR(params.number, {
      title: params.title,
      body: params.body,
      state: params.state as 'open' | 'closed' | undefined,
    });
    return successResult(pr);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error updating PR: ${message}`);
  }
}

export async function handleRepoPrComment(
  params: {
    number: number;
    body: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    await manager.addPRComment(params.number, params.body);
    return successResult({ commented: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error commenting on PR: ${message}`);
  }
}

export async function handleRepoPrReview(
  params: {
    number: number;
    action: string;
    comment?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    await manager.reviewPR(params.number, {
      action: params.action as 'approve' | 'request_changes' | 'comment',
      comment: params.comment,
    });
    return successResult({ reviewed: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error reviewing PR: ${message}`);
  }
}

export async function handleRepoPrRequestReview(
  params: {
    number: number;
    reviewers: string[];
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    await manager.requestReview(params.number, params.reviewers);
    return successResult({ requested: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error requesting review: ${message}`);
  }
}

export async function handleRepoPrApprove(
  params: {
    number: number;
    comment?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    await manager.approvePR(params.number, params.comment);
    return successResult({ approved: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error approving PR: ${message}`);
  }
}

export async function handleRepoPrMerge(
  params: {
    number: number;
    strategy?: string;
    delete_branch?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const pr = await manager.mergePR(params.number, {
      strategy: params.strategy as 'merge' | 'squash' | 'rebase' | undefined,
      deleteBranch: params.delete_branch,
    });
    return successResult(pr);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error merging PR: ${message}`);
  }
}

export async function handleRepoPrList(
  params: {
    state?: string;
    author?: string;
    limit?: number;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const prs = await manager.listPRs({
      state: params.state as 'open' | 'closed' | 'all' | undefined,
      author: params.author,
      limit: params.limit,
    });
    return successResult(prs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error listing PRs: ${message}`);
  }
}

// ============================================================================
// Tags
// ============================================================================

export async function handleRepoTagCreate(
  params: {
    name: string;
    message?: string;
    sha?: string;
    commit?: string;
    sign?: boolean;
    force?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    manager.createTag(params.name, {
      name: params.name,
      message: params.message,
      sha: params.sha,
      commit: params.commit,
      sign: params.sign,
      force: params.force,
    });
    return successResult({ tag: params.name, created: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error creating tag: ${message}`);
  }
}

export async function handleRepoTagDelete(
  params: { name: string },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    manager.deleteTag(params.name);
    return successResult({ tag: params.name, deleted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error deleting tag: ${message}`);
  }
}

export async function handleRepoTagPush(
  params: {
    name: string;
    remote?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    manager.pushTag(params.name, params.remote);
    return successResult({ tag: params.name, pushed: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error pushing tag: ${message}`);
  }
}

export async function handleRepoTagList(
  params: {
    pattern?: string;
    latest?: number;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const tags = manager.listTags({
      pattern: params.pattern,
      latest: params.latest,
    });
    return successResult(tags);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error listing tags: ${message}`);
  }
}

// ============================================================================
// Worktrees
// ============================================================================

export async function handleRepoWorktreeCreate(
  params: {
    path: string;
    branch: string;
    base_branch?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const worktree = manager.createWorktree({
      path: params.path,
      branch: params.branch,
      baseBranch: params.base_branch,
    });
    return successResult(worktree);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error creating worktree: ${message}`);
  }
}

export async function handleRepoWorktreeList(
  _params: Record<string, never>,
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const worktrees = manager.listWorktrees();
    return successResult(worktrees);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error listing worktrees: ${message}`);
  }
}

export async function handleRepoWorktreeRemove(
  params: {
    path: string;
    force?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    manager.removeWorktree(params.path, params.force);
    return successResult({ path: params.path, removed: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error removing worktree: ${message}`);
  }
}

export async function handleRepoWorktreePrune(
  _params: Record<string, never>,
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    manager.pruneWorktrees();
    return successResult({ pruned: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error pruning worktrees: ${message}`);
  }
}

export async function handleRepoWorktreeCleanup(
  params: {
    merged?: boolean;
    force?: boolean;
    delete_branch?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new RepoManager(config.repo);
    const result = await manager.cleanupWorktrees({
      merged: params.merged,
      force: params.force,
      deleteBranch: params.delete_branch,
    });
    return successResult(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error cleaning up worktrees: ${message}`);
  }
}
