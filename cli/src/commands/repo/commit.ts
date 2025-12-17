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
          await repoManager.stage('.');
        }

        // Build commit message
        let message = options.message;

        if (options.type) {
          const scope = options.scope ? `(${options.scope})` : '';
          const breaking = options.breaking ? '!' : '';
          message = `${options.type}${scope}${breaking}: ${options.message}`;
        }

        // Add work ID to footer if provided
        if (options.workId) {
          message += `\n\nWork-ID: ${options.workId}`;
        }

        // Add breaking change footer if marked
        if (options.breaking && !message.includes('BREAKING CHANGE:')) {
          message += '\n\nBREAKING CHANGE: ' + options.message;
        }

        const commit = await repoManager.commit(message);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: commit }, null, 2));
        } else {
          console.log(chalk.green(`✓ Created commit: ${commit.hash?.substring(0, 7)}`));
          console.log(chalk.gray(message.split('\n')[0]));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
