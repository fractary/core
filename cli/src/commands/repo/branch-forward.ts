/**
 * Branch forward operation - merge a source branch into a target branch
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getRepoManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

export function createBranchForwardCommand(): Command {
  return new Command('branch-forward')
    .description('Forward (merge) a source branch into a target branch via git merge. PR remains open.')
    .option('--source <branch>', 'Branch to merge from (default: current branch)')
    .requiredOption('--target <branch>', 'Branch to merge into (required)')
    .option('--create-from <branch>', 'Create target from this base if it does not exist')
    .option('--push', 'Push target branch after merge')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const repoManager = await getRepoManager();

        const result = await repoManager.forwardBranch({
          source: options.source,
          target: options.target,
          createFrom: options.createFrom,
          push: options.push,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          if (result.created) {
            console.log(chalk.green(`✓ Created target branch: ${result.target}`));
          }
          console.log(chalk.green(`✓ Merged ${result.source} into ${result.target}`));
          console.log(chalk.gray(`Merge commit: ${result.mergeCommitSha.substring(0, 8)}`));
          if (result.pushed) {
            console.log(chalk.gray(`Pushed ${result.target} to remote`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
