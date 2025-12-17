/**
 * Status, push, and pull operations for repository management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getRepoManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

export function createStatusCommand(): Command {
  return new Command('status')
    .description('Show repository status')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const repoManager = await getRepoManager();
        const status = await repoManager.getStatus();

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: status }, null, 2));
        } else {
          console.log(chalk.bold('Repository Status'));
          console.log(chalk.gray(`Branch: ${status.branch}`));

          if (status.staged && status.staged.length > 0) {
            console.log(chalk.green('\nStaged changes:'));
            status.staged.forEach((file: string) => {
              console.log(chalk.green(`  + ${file}`));
            });
          }

          if (status.unstaged && status.unstaged.length > 0) {
            console.log(chalk.yellow('\nUnstaged changes:'));
            status.unstaged.forEach((file: string) => {
              console.log(chalk.yellow(`  M ${file}`));
            });
          }

          if (status.untracked && status.untracked.length > 0) {
            console.log(chalk.red('\nUntracked files:'));
            status.untracked.forEach((file: string) => {
              console.log(chalk.red(`  ? ${file}`));
            });
          }

          if (
            (!status.staged || status.staged.length === 0) &&
            (!status.unstaged || status.unstaged.length === 0) &&
            (!status.untracked || status.untracked.length === 0)
          ) {
            console.log(chalk.green('\nWorking tree clean'));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createPushCommand(): Command {
  return new Command('push')
    .description('Push commits to remote')
    .option('--remote <name>', 'Remote name', 'origin')
    .option('--set-upstream', 'Set upstream branch')
    .option('--force', 'Force push (use with caution)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const repoManager = await getRepoManager();

        const result = await repoManager.push({
          remote: options.remote,
          setUpstream: options.setUpstream,
          force: options.force,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          console.log(chalk.green(`✓ Pushed to ${options.remote}`));
          if (options.setUpstream) {
            console.log(chalk.gray('Upstream branch set'));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createPullCommand(): Command {
  return new Command('pull')
    .description('Pull changes from remote')
    .option('--remote <name>', 'Remote name', 'origin')
    .option('--rebase', 'Rebase instead of merge')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const repoManager = await getRepoManager();

        const result = await repoManager.pull({
          remote: options.remote,
          rebase: options.rebase,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          console.log(chalk.green(`✓ Pulled from ${options.remote}`));
          if (result.conflicts && result.conflicts.length > 0) {
            console.log(chalk.yellow('\nConflicts detected:'));
            result.conflicts.forEach((file: string) => {
              console.log(chalk.yellow(`  ! ${file}`));
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
