/**
 * Repo subcommand - Repository operations
 *
 * Provides branch, commit, pr, tag, and worktree operations via @fractary/core RepoManager.
 */

import { Command } from 'commander';
import { createBranchCommands } from './branch';
import { createCommitCommand } from './commit';
import { createPRCommands } from './pr';
import { createTagCommands } from './tag';
import { createWorktreeCommands } from './worktree';
import { createStatusCommand, createPushCommand, createPullCommand } from './status';

/**
 * Create the repo command tree
 */
export function createRepoCommand(): Command {
  const repo = new Command('repo').description('Repository operations');

  // Add all command groups
  repo.addCommand(createBranchCommands());
  repo.addCommand(createCommitCommand());
  repo.addCommand(createPRCommands());
  repo.addCommand(createTagCommands());
  repo.addCommand(createWorktreeCommands());

  // Add standalone commands
  repo.addCommand(createStatusCommand());
  repo.addCommand(createPushCommand());
  repo.addCommand(createPullCommand());

  return repo;
}
