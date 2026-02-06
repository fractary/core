/**
 * Template operations for specification management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getSpecManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

export function createTemplateListCommand(): Command {
  return new Command('template-list')
    .description('List available specification templates')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const specManager = await getSpecManager();
        const templates = specManager.getTemplates();

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: templates }, null, 2));
        } else {
          console.log(chalk.bold('Available Templates:'));
          templates.forEach((template: any) => {
            console.log(`\n${chalk.green(template.name)}`);
            console.log(chalk.gray(`  ${template.description}`));
          });
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
