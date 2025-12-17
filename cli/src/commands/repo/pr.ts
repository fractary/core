/**
 * Pull Request operations for repository management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getRepoManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

export function createPRCommands(): Command {
  const pr = new Command('pr').description('Pull request operations');

  pr.addCommand(createPRCreateCommand());
  pr.addCommand(createPRListCommand());
  pr.addCommand(createPRMergeCommand());
  pr.addCommand(createPRReviewCommand());

  return pr;
}

function createPRCreateCommand(): Command {
  return new Command('create')
    .description('Create a new pull request')
    .requiredOption('--title <title>', 'PR title')
    .option('--body <body>', 'PR body/description')
    .option('--base <branch>', 'Base branch (default: main/master)')
    .option('--head <branch>', 'Head branch (default: current branch)')
    .option('--draft', 'Create as draft PR')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const repoManager = await getRepoManager();

        const pr = await repoManager.createPullRequest({
          title: options.title,
          body: options.body,
          base: options.base,
          head: options.head,
          draft: options.draft,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: pr }, null, 2));
        } else {
          console.log(chalk.green(`✓ Created pull request #${pr.number}`));
          console.log(chalk.gray(`Title: ${pr.title}`));
          if (pr.url) {
            console.log(chalk.gray(`URL: ${pr.url}`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createPRListCommand(): Command {
  return new Command('list')
    .description('List pull requests')
    .option('--state <state>', 'Filter by state (open, closed, all)', 'open')
    .option('--author <username>', 'Filter by author')
    .option('--limit <n>', 'Limit results', '10')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const repoManager = await getRepoManager();

        const prs = await repoManager.listPullRequests({
          state: options.state,
          author: options.author,
        });

        const limitedPRs = options.limit ? prs.slice(0, parseInt(options.limit, 10)) : prs;

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: limitedPRs }, null, 2));
        } else {
          if (limitedPRs.length === 0) {
            console.log(chalk.yellow('No pull requests found'));
          } else {
            limitedPRs.forEach((pr: any) => {
              console.log(`#${pr.number} ${pr.title} [${pr.state}]`);
              if (pr.author) {
                console.log(chalk.gray(`  by ${pr.author}`));
              }
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createPRMergeCommand(): Command {
  return new Command('merge')
    .description('Merge a pull request')
    .argument('<number>', 'PR number')
    .option('--strategy <strategy>', 'Merge strategy (merge, squash, rebase)', 'merge')
    .option('--delete-branch', 'Delete branch after merge')
    .option('--json', 'Output as JSON')
    .action(async (number: string, options) => {
      try {
        const repoManager = await getRepoManager();

        const result = await repoManager.mergePullRequest(parseInt(number, 10), {
          mergeMethod: options.strategy,
          deleteBranch: options.deleteBranch,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          console.log(chalk.green(`✓ Merged pull request #${number}`));
          if (options.deleteBranch) {
            console.log(chalk.gray('Branch deleted'));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createPRReviewCommand(): Command {
  return new Command('review')
    .description('Review a pull request')
    .argument('<number>', 'PR number')
    .option('--approve', 'Approve the PR')
    .option('--request-changes', 'Request changes')
    .option('--comment <text>', 'Add review comment')
    .option('--json', 'Output as JSON')
    .action(async (number: string, options) => {
      try {
        const repoManager = await getRepoManager();

        let event = 'COMMENT';
        if (options.approve) {
          event = 'APPROVE';
        } else if (options.requestChanges) {
          event = 'REQUEST_CHANGES';
        }

        const review = await repoManager.reviewPullRequest(parseInt(number, 10), {
          event,
          body: options.comment,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: review }, null, 2));
        } else {
          if (event === 'APPROVE') {
            console.log(chalk.green(`✓ Approved pull request #${number}`));
          } else if (event === 'REQUEST_CHANGES') {
            console.log(chalk.yellow(`✓ Requested changes on pull request #${number}`));
          } else {
            console.log(chalk.green(`✓ Commented on pull request #${number}`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
