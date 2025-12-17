/**
 * Worktree operations for repository management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getRepoManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

export function createWorktreeCommands(): Command {
  const worktree = new Command('worktree').description('Worktree operations');

  worktree.addCommand(createWorktreeCreateCommand());
  worktree.addCommand(createWorktreeListCommand());
  worktree.addCommand(createWorktreeRemoveCommand());
  worktree.addCommand(createWorktreeCleanupCommand());

  return worktree;
}

function createWorktreeCreateCommand(): Command {
  return new Command('create')
    .description('Create a new worktree')
    .argument('<branch>', 'Branch name')
    .option('--path <path>', 'Worktree path')
    .option('--work-id <id>', 'Work item ID')
    .option('--json', 'Output as JSON')
    .action(async (branch: string, options) => {
      try {
        const repoManager = await getRepoManager();

        const worktree = repoManager.createWorktree({
          branch,
          path: options.path || `.worktrees/${branch}`,
          workId: options.workId,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: worktree }, null, 2));
        } else {
          console.log(chalk.green(`✓ Created worktree for branch: ${branch}`));
          console.log(chalk.gray(`Path: ${worktree.path}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createWorktreeListCommand(): Command {
  return new Command('list')
    .description('List worktrees')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const repoManager = await getRepoManager();
        const worktrees = await repoManager.listWorktrees();

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: worktrees }, null, 2));
        } else {
          if (worktrees.length === 0) {
            console.log(chalk.yellow('No worktrees'));
          } else {
            worktrees.forEach((wt: any) => {
              const isCurrent = wt.current ? chalk.green('* ') : '  ';
              console.log(`${isCurrent}${wt.path} [${wt.branch}]`);
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createWorktreeRemoveCommand(): Command {
  return new Command('remove')
    .description('Remove a worktree')
    .argument('<path>', 'Worktree path')
    .option('--force', 'Force removal even with uncommitted changes')
    .option('--json', 'Output as JSON')
    .action(async (path: string, options) => {
      try {
        const repoManager = await getRepoManager();

        repoManager.removeWorktree(path, options.force);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: { path } }, null, 2));
        } else {
          console.log(chalk.green(`✓ Removed worktree: ${path}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createWorktreeCleanupCommand(): Command {
  return new Command('cleanup')
    .description('Clean up stale worktrees')
    .option('--merged', 'Remove only merged worktrees')
    .option('--stale', 'Remove only stale worktrees')
    .option('--dry-run', 'Show what would be removed without removing')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const repoManager = await getRepoManager();

        const result = await repoManager.cleanupWorktrees({
          merged: options.merged,
          stale: options.stale,
          dryRun: options.dryRun,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          if (options.dryRun) {
            console.log(chalk.yellow(`Would remove ${result.removed?.length || 0} worktrees`));
            if (result.removed && result.removed.length > 0) {
              result.removed.forEach((path: string) => {
                console.log(chalk.gray(`  - ${path}`));
              });
            }
          } else {
            console.log(chalk.green(`✓ Cleaned up ${result.removed?.length || 0} worktrees`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
