/**
 * Commit operations for repository management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getRepoManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

export function createCommitCommand(): Command {
  return new Command('commit')
    .description('Create a commit with conventional commit format')
    .requiredOption('--message <msg>', 'Commit message')
    .option('--type <type>', 'Commit type (feat, fix, chore, docs, style, refactor, test, build)')
    .option('--scope <scope>', 'Commit scope')
    .option('--work-id <id>', 'Work item ID')
    .option('--breaking', 'Mark as breaking change')
    .option('--all', 'Stage all changes before committing')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const repoManager = await getRepoManager();

        // Stage all changes if requested
        if (options.all) {
          repoManager.stage(['.']);
        }

        const commit = repoManager.commit({
          message: options.message,
          type: options.type,
          scope: options.scope,
          workId: options.workId,
          breaking: options.breaking,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: commit }, null, 2));
        } else {
          console.log(chalk.green(`✓ Created commit: ${commit.sha?.substring(0, 7)}`));
          console.log(chalk.gray(commit.message.split('\n')[0]));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
