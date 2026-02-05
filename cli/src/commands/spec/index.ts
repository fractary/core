/**
 * Spec subcommand - Specification management
 *
 * Commands use dashes to mirror plugin naming:
 * CLI: fractary-core spec spec-create
 * Plugin: /fractary-spec:spec-create
 */

import { Command } from 'commander';
import { createSpecCreateCommand, createSpecGetCommand, createSpecListCommand, createSpecUpdateCommand, createSpecDeleteCommand, createSpecValidateCommand, createSpecRefineCommand } from './spec';
import { createTemplateListCommand } from './template';

/**
 * Create the spec command tree
 */
export function createSpecCommand(): Command {
  const spec = new Command('spec').description('Specification management');

  // Spec operations (flat with dashes)
  spec.addCommand(createSpecCreateCommand());
  spec.addCommand(createSpecGetCommand());
  spec.addCommand(createSpecListCommand());
  spec.addCommand(createSpecUpdateCommand());
  spec.addCommand(createSpecDeleteCommand());
  spec.addCommand(createSpecValidateCommand());
  spec.addCommand(createSpecRefineCommand());

  // Template operations (flat with dashes)
  spec.addCommand(createTemplateListCommand());

  return spec;
}
