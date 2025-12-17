import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Helper function to create a successful tool result
 * @param data - The data to return
 * @returns CallToolResult with success data
 */
export function successResult(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Helper function to create an error tool result
 * @param message - The error message
 * @returns CallToolResult with error
 */
export function errorResult(message: string): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Type guard for issue state
 */
export function isValidIssueState(value: string | undefined): value is 'open' | 'closed' | 'all' | undefined {
  return value === undefined || ['open', 'closed', 'all'].includes(value);
}

/**
 * Type guard for PR state
 */
export function isValidPrState(value: string | undefined): value is 'open' | 'closed' | undefined {
  return value === undefined || ['open', 'closed'].includes(value);
}

/**
 * Type guard for FABER context
 */
export function isValidFaberContext(value: string | undefined): value is 'frame' | 'architect' | 'build' | 'evaluate' | 'release' | undefined {
  return value === undefined || ['frame', 'architect', 'build', 'evaluate', 'release'].includes(value);
}

/**
 * Type guard for branch location
 */
export function isValidBranchLocation(value: string | undefined): value is 'local' | 'remote' | 'both' | undefined {
  return value === undefined || ['local', 'remote', 'both'].includes(value);
}

/**
 * Type guard for branch type
 */
export function isValidBranchType(value: string): value is 'feature' | 'fix' | 'chore' | 'docs' {
  return ['feature', 'fix', 'chore', 'docs'].includes(value);
}

/**
 * Type guard for commit type
 */
export function isValidCommitType(value: string | undefined): value is 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore' | undefined {
  return value === undefined || ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'].includes(value);
}

/**
 * Type guard for PR review action
 */
export function isValidReviewAction(value: string): value is 'approve' | 'request_changes' | 'comment' {
  return ['approve', 'request_changes', 'comment'].includes(value);
}

/**
 * Type guard for PR merge strategy
 */
export function isValidMergeStrategy(value: string | undefined): value is 'merge' | 'squash' | 'rebase' | undefined {
  return value === undefined || ['merge', 'squash', 'rebase'].includes(value);
}

/**
 * Validate that work config exists and has required fields
 */
export function validateWorkConfig(config: { work?: unknown }): config is { work: Record<string, unknown> } {
  if (!config.work) {
    return false;
  }
  const workConfig = config.work as Record<string, unknown>;
  return !!(workConfig.platform && workConfig.token);
}

/**
 * Validate that repo config exists and has required fields
 */
export function validateRepoConfig(config: { repo?: unknown }): config is { repo: Record<string, unknown> } {
  if (!config.repo) {
    return false;
  }
  const repoConfig = config.repo as Record<string, unknown>;
  return !!(repoConfig.platform && repoConfig.token);
}
