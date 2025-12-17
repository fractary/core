/**
 * Tag operations for repository management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getRepoManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

export function createTagCommands(): Command {
  const tag = new Command('tag').description('Tag operations');

  tag.addCommand(createTagCreateCommand());
  tag.addCommand(createTagPushCommand());
  tag.addCommand(createTagListCommand());

  return tag;
}

function createTagCreateCommand(): Command {
  return new Command('create')
    .description('Create a new tag')
    .argument('<name>', 'Tag name')
    .option('--message <msg>', 'Tag message (creates annotated tag)')
    .option('--sign', 'Create a GPG-signed tag')
    .option('--force', 'Replace existing tag')
    .option('--json', 'Output as JSON')
    .action(async (name: string, options) => {
      try {
        const repoManager = await getRepoManager();

        const tag = await repoManager.createTag(name, {
          message: options.message,
          sign: options.sign,
          force: options.force,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: tag }, null, 2));
        } else {
          console.log(chalk.green(`✓ Created tag: ${tag.name}`));
          if (options.message) {
            console.log(chalk.gray('Annotated tag'));
          }
          if (options.sign) {
            console.log(chalk.gray('GPG signed'));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createTagPushCommand(): Command {
  return new Command('push')
    .description('Push tag(s) to remote')
    .argument('<name>', 'Tag name or "all" for all tags')
    .option('--remote <name>', 'Remote name', 'origin')
    .option('--json', 'Output as JSON')
    .action(async (name: string, options) => {
      try {
        const repoManager = await getRepoManager();

        if (name === 'all') {
          await repoManager.pushTags(options.remote);
          if (options.json) {
            console.log(JSON.stringify({ status: 'success', data: { pushed: 'all' } }, null, 2));
          } else {
            console.log(chalk.green(`✓ Pushed all tags to ${options.remote}`));
          }
        } else {
          await repoManager.pushTag(name, options.remote);
          if (options.json) {
            console.log(
              JSON.stringify({ status: 'success', data: { tag: name, remote: options.remote } }, null, 2)
            );
          } else {
            console.log(chalk.green(`✓ Pushed tag ${name} to ${options.remote}`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createTagListCommand(): Command {
  return new Command('list')
    .description('List tags')
    .option('--pattern <pattern>', 'Filter by pattern')
    .option('--latest <n>', 'Show only latest N tags')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const repoManager = await getRepoManager();

        const tags = await repoManager.listTags({
          pattern: options.pattern,
        });

        const limitedTags = options.latest ? tags.slice(-parseInt(options.latest, 10)) : tags;

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: limitedTags }, null, 2));
        } else {
          if (limitedTags.length === 0) {
            console.log(chalk.yellow('No tags found'));
          } else {
            limitedTags.reverse().forEach((tag: any) => {
              console.log(`  ${tag.name}`);
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
