/**
 * Spec operations for specification management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getSpecManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

export function createSpecCreateFileCommand(): Command {
  return new Command('spec-create-file')
    .description('Create a new specification file')
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

export function createSpecGetCommand(): Command {
  return new Command('spec-get')
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

export function createSpecListCommand(): Command {
  return new Command('spec-list')
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

export function createSpecUpdateCommand(): Command {
  return new Command('spec-update')
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

export function createSpecDeleteCommand(): Command {
  return new Command('spec-delete')
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

export function createSpecValidateCheckCommand(): Command {
  return new Command('spec-validate-check')
    .description('Run structural validation checks on a specification')
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

export function createSpecRefineScanCommand(): Command {
  return new Command('spec-refine-scan')
    .description('Scan a specification for structural gaps and refinement areas')
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
