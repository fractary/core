/**
 * Spec subcommand - Specification management
 *
 * Commands use dashes to mirror plugin naming:
 * CLI: fractary-core spec spec-create-file
 * Plugin: /fractary-spec:spec-create (AI agent calls spec-create-file internally)
 */

import { Command } from 'commander';
import { createSpecCreateFileCommand, createSpecGetCommand, createSpecListCommand, createSpecUpdateCommand, createSpecDeleteCommand, createSpecValidateCheckCommand, createSpecRefineScanCommand } from './spec';
import { createTemplateListCommand } from './template';

/**
 * Create the spec command tree
 */
export function createSpecCommand(): Command {
  const spec = new Command('spec').description('Specification management');

  // Spec operations (flat with dashes)
  spec.addCommand(createSpecCreateFileCommand());
  spec.addCommand(createSpecGetCommand());
  spec.addCommand(createSpecListCommand());
  spec.addCommand(createSpecUpdateCommand());
  spec.addCommand(createSpecDeleteCommand());
  spec.addCommand(createSpecValidateCheckCommand());
  spec.addCommand(createSpecRefineScanCommand());

  // Template operations (flat with dashes)
  spec.addCommand(createTemplateListCommand());

  return spec;
}
