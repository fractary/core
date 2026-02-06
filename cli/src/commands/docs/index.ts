/**
 * Docs subcommand - Documentation management
 *
 * Commands use dashes to mirror plugin naming:
 * CLI: fractary-core docs doc-create
 * Plugin: /fractary-docs:doc-create
 */

import { Command } from 'commander';
import { createDocCreateCommand, createDocGetCommand, createDocListCommand, createDocUpdateCommand, createDocDeleteCommand, createDocSearchCommand, createDocArchiveCommand, createDocRefineScanCommand, createDocValidateFulfillmentCommand } from './doc';
import { createTypeListCommand, createTypeInfoCommand } from './type';

/**
 * Create the docs command tree
 */
export function createDocsCommand(): Command {
  const docs = new Command('docs').description('Documentation management');

  // Document operations (flat with dashes)
  docs.addCommand(createDocCreateCommand());
  docs.addCommand(createDocGetCommand());
  docs.addCommand(createDocListCommand());
  docs.addCommand(createDocUpdateCommand());
  docs.addCommand(createDocDeleteCommand());
  docs.addCommand(createDocSearchCommand());

  // Archive, refinement, and fulfillment operations
  docs.addCommand(createDocArchiveCommand());
  docs.addCommand(createDocRefineScanCommand());
  docs.addCommand(createDocValidateFulfillmentCommand());

  // Type operations (flat with dashes)
  docs.addCommand(createTypeListCommand());
  docs.addCommand(createTypeInfoCommand());

  return docs;
}
