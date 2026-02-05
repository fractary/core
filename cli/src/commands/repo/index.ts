/**
 * Repo subcommand - Repository operations
 *
 * Commands use dashes to mirror plugin naming:
 * CLI: fractary-core repo branch-create
 * Plugin: /fractary-repo:branch-create
 */

import { Command } from 'commander';
import { createBranchCreateCommand, createBranchDeleteCommand, createBranchListCommand } from './branch';
import { createCommitCommand } from './commit';
import { createPRCreateCommand, createPRListCommand, createPRMergeCommand, createPRReviewCommand } from './pr';
import { createTagCreateCommand, createTagPushCommand, createTagListCommand } from './tag';
import {
  createWorktreeCreateCommand,
  createWorktreeListCommand,
  createWorktreeRemoveCommand,
  createWorktreeCleanupCommand,
} from './worktree';
import { createStatusCommand, createPushCommand, createPullCommand } from './status';

/**
 * Create the repo command tree
 */
export function createRepoCommand(): Command {
  const repo = new Command('repo').description('Repository operations');

  // Branch operations (flat with dashes)
  repo.addCommand(createBranchCreateCommand());
  repo.addCommand(createBranchDeleteCommand());
  repo.addCommand(createBranchListCommand());

  // Commit
  repo.addCommand(createCommitCommand());

  // PR operations (flat with dashes)
  repo.addCommand(createPRCreateCommand());
  repo.addCommand(createPRListCommand());
  repo.addCommand(createPRMergeCommand());
  repo.addCommand(createPRReviewCommand());

  // Tag operations (flat with dashes)
  repo.addCommand(createTagCreateCommand());
  repo.addCommand(createTagPushCommand());
  repo.addCommand(createTagListCommand());

  // Worktree operations (flat with dashes)
  repo.addCommand(createWorktreeCreateCommand());
  repo.addCommand(createWorktreeListCommand());
  repo.addCommand(createWorktreeRemoveCommand());
  repo.addCommand(createWorktreeCleanupCommand());

  // Standalone commands
  repo.addCommand(createStatusCommand());
  repo.addCommand(createPushCommand());
  repo.addCommand(createPullCommand());

  return repo;
}
