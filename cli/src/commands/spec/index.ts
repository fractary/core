/**
 * Spec subcommand - Specification management
 *
 * Provides spec operations via @fractary/core SpecManager.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getSpecManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

/**
 * Create the spec command tree
 */
export function createSpecCommand(): Command {
  const spec = new Command('spec').description('Specification management');

  spec.addCommand(createSpecCreateCommand());
  spec.addCommand(createSpecGetCommand());
  spec.addCommand(createSpecListCommand());
  spec.addCommand(createSpecUpdateCommand());
  spec.addCommand(createSpecValidateCommand());
  spec.addCommand(createSpecRefineCommand());
  spec.addCommand(createSpecDeleteCommand());
  spec.addCommand(createSpecTemplatesCommand());

  return spec;
}

function createSpecCreateCommand(): Command {
  return new Command('create')
    .description('Create a new specification')
    .argument('<title>', 'Specification title')
    .option('--template <type>', 'Specification template (feature, bugfix, refactor)', 'feature')
    .option('--work-id <id>', 'Associated work item ID')
    .option('--json', 'Output as JSON')
    .action(async (title: string, options) => {
      try {
        const specManager = await getSpecManager();
        const spec = specManager.createSpec(title, {
          template: options.template,
          workId: options.workId,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: spec }, null, 2));
        } else {
          console.log(chalk.green(`✓ Created specification: ${spec.title}`));
          console.log(chalk.gray(`  ID: ${spec.id}`));
          console.log(chalk.gray(`  Path: ${spec.path}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createSpecGetCommand(): Command {
  return new Command('get')
    .description('Get a specification by ID or path')
    .argument('<id>', 'Specification ID or path')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const specManager = await getSpecManager();
        const spec = specManager.getSpec(id);

        if (!spec) {
          if (options.json) {
            console.error(
              JSON.stringify(
                {
                  status: 'error',
                  error: { code: 'SPEC_NOT_FOUND', message: `Specification not found: ${id}` },
                },
                null,
                2
              )
            );
          } else {
            console.error(chalk.red(`Specification not found: ${id}`));
          }
          process.exit(3);
        }

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: spec }, null, 2));
        } else {
          console.log(chalk.bold(`${spec.title}`));
          console.log(chalk.gray(`ID: ${spec.id}`));
          console.log(chalk.gray(`Status: ${spec.metadata.validation_status || 'not_validated'}`));
          console.log(chalk.gray(`Work ID: ${spec.workId || 'N/A'}`));
          console.log('\n' + spec.content);
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createSpecListCommand(): Command {
  return new Command('list')
    .description('List specifications')
    .option('--status <status>', 'Filter by status (draft, validated, needs_revision)')
    .option('--work-id <id>', 'Filter by work item ID')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const specManager = await getSpecManager();
        const specs = specManager.listSpecs({
          status: options.status,
          workId: options.workId,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: specs }, null, 2));
        } else {
          if (specs.length === 0) {
            console.log(chalk.yellow('No specifications found'));
          } else {
            specs.forEach((spec: any) => {
              const status = spec.metadata.validation_status || 'draft';
              console.log(`${spec.id}: ${spec.title} [${status}]`);
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createSpecUpdateCommand(): Command {
  return new Command('update')
    .description('Update a specification')
    .argument('<id>', 'Specification ID or path')
    .option('--title <title>', 'New title')
    .option('--content <content>', 'New content')
    .option('--work-id <id>', 'Update work item ID')
    .option('--status <status>', 'Update status')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const specManager = await getSpecManager();
        const spec = specManager.updateSpec(id, {
          title: options.title,
          content: options.content,
          workId: options.workId,
          validationStatus: options.status,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: spec }, null, 2));
        } else {
          console.log(chalk.green(`✓ Updated specification: ${spec.id}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createSpecValidateCommand(): Command {
  return new Command('validate')
    .description('Validate a specification')
    .argument('<id>', 'Specification ID or path')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const specManager = await getSpecManager();
        const result = specManager.validateSpec(id);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          console.log(chalk.bold(`Validation Result: ${result.status.toUpperCase()}`));
          console.log(chalk.gray(`Score: ${result.score}%`));

          if (result.checks.requirements) {
            const req = result.checks.requirements;
            console.log(chalk.gray(`\nRequirements: ${req.completed}/${req.total} - ${req.status}`));
          }
          if (result.checks.acceptanceCriteria) {
            const ac = result.checks.acceptanceCriteria;
            console.log(chalk.gray(`Acceptance Criteria: ${ac.met}/${ac.total} - ${ac.status}`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createSpecRefineCommand(): Command {
  return new Command('refine')
    .description('Generate refinement questions for a specification')
    .argument('<id>', 'Specification ID or path')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const specManager = await getSpecManager();
        const questions = specManager.generateRefinementQuestions(id);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: questions }, null, 2));
        } else {
          if (questions.length === 0) {
            console.log(chalk.green('No refinement questions needed'));
          } else {
            console.log(chalk.bold('Refinement Questions:'));
            questions.forEach((question: any, idx: number) => {
              console.log(`\n${idx + 1}. ${chalk.yellow(question.question)}`);
              console.log(chalk.gray(`   Category: ${question.category}`));
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createSpecDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete a specification')
    .argument('<id>', 'Specification ID or path')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const specManager = await getSpecManager();
        specManager.deleteSpec(id);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: { id } }, null, 2));
        } else {
          console.log(chalk.green(`✓ Deleted specification: ${id}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createSpecTemplatesCommand(): Command {
  return new Command('templates')
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
