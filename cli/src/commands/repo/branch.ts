/**
 * Branch operations for repository management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getRepoManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

export function createBranchCommands(): Command {
  const branch = new Command('branch').description('Branch operations');

  branch.addCommand(createBranchCreateCommand());
  branch.addCommand(createBranchDeleteCommand());
  branch.addCommand(createBranchListCommand());

  return branch;
}

function createBranchCreateCommand(): Command {
  return new Command('create')
    .description('Create a new branch')
    .argument('<name>', 'Branch name')
    .option('--base <branch>', 'Base branch')
    .option('--checkout', 'Checkout after creation')
    .option('--json', 'Output as JSON')
    .action(async (name: string, options) => {
      try {
        const repoManager = await getRepoManager();
        const branch = await repoManager.createBranch(name, {
          baseBranch: options.base,
          checkout: options.checkout,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: branch }, null, 2));
        } else {
          console.log(chalk.green(`✓ Created branch: ${branch.name}`));
          if (options.checkout) {
            console.log(chalk.gray(`Checked out to ${branch.name}`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createBranchDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete a branch')
    .argument('<name>', 'Branch name')
    .option('--location <where>', 'Delete location: local|remote|both', 'local')
    .option('--force', 'Force delete even if not merged')
    .option('--json', 'Output as JSON')
    .action(async (name: string, options) => {
      try {
        const repoManager = await getRepoManager();

        if (options.location === 'both' || options.location === 'local') {
          await repoManager.deleteBranch(name, { force: options.force });
          if (!options.json) {
            console.log(chalk.green(`✓ Deleted local branch: ${name}`));
          }
        }

        if (options.location === 'both' || options.location === 'remote') {
          await repoManager.deleteBranch(name, { remote: true, force: options.force });
          if (!options.json) {
            console.log(chalk.green(`✓ Deleted remote branch: ${name}`));
          }
        }

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'success',
                data: {
                  branch: name,
                  location: options.location,
                },
              },
              null,
              2
            )
          );
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createBranchListCommand(): Command {
  return new Command('list')
    .description('List branches')
    .option('--merged', 'Show only merged branches')
    .option('--stale', 'Show only stale branches')
    .option('--pattern <pattern>', 'Filter by pattern')
    .option('--limit <n>', 'Limit results', '20')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const repoManager = await getRepoManager();
        const branches = await repoManager.listBranches({
          merged: options.merged,
          pattern: options.pattern,
        });

        const limitedBranches = options.limit
          ? branches.slice(0, parseInt(options.limit, 10))
          : branches;

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: limitedBranches }, null, 2));
        } else {
          if (limitedBranches.length === 0) {
            console.log(chalk.yellow('No branches found'));
          } else {
            const currentBranch = await repoManager.getCurrentBranch();
            limitedBranches.forEach((branch: any) => {
              const isCurrent = branch.name === currentBranch;
              const prefix = isCurrent ? chalk.green('* ') : '  ';
              const name = isCurrent ? chalk.green(branch.name) : branch.name;
              console.log(`${prefix}${name}`);
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
