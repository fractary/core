#!/usr/bin/env node

/**
 * Fractary Core CLI - Command-line interface for core operations
 *
 * Binary entry point for `fractary-core` command
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { loadEnv } from '@fractary/core/config';
import { createWorkCommand } from './commands/work';
import { createRepoCommand } from './commands/repo';
import { createSpecCommand } from './commands/spec';
import { createLogsCommand } from './commands/logs';
import { createFileCommand } from './commands/file';
import { createDocsCommand } from './commands/docs';
import { registerConfigCommand } from './commands/config';

// Load environment variables from .env files before any config loading
// This ensures tokens and other settings are available to SDK operations
loadEnv();

// Package information
const packageJson = require('../package.json');

// Create main program
const program = new Command();

program
  .name('fractary-core')
  .description('CLI for Fractary Core SDK - work, repo, spec, logs, file, docs')
  .version(packageJson.version);

// Add all command trees
program.addCommand(createWorkCommand());
program.addCommand(createRepoCommand());
program.addCommand(createSpecCommand());
program.addCommand(createLogsCommand());
program.addCommand(createFileCommand());
program.addCommand(createDocsCommand());

// Add config command
registerConfigCommand(program);

// Custom help text
program.addHelpText(
  'after',
  `
${chalk.bold('Commands:')}
  config      Manage configuration (validate, show)
  work        Work item tracking (issues, comments, labels, milestones)
  repo        Repository operations (branches, commits, PRs, tags, worktrees)
  spec        Specification management (create, validate, refine)
  logs        Log management (capture, search, archive)
  file        File storage operations (read, write, list, delete)
  docs        Documentation management (create, search, export)

${chalk.bold('Examples:')}
  $ fractary-core config validate
  $ fractary-core config show
  $ fractary-core work issue fetch 123
  $ fractary-core repo commit --message "Add feature" --type feat
  $ fractary-core spec validate SPEC-20241216
  $ fractary-core logs search --query "error" --type session
  $ fractary-core file write data.json --content '{"key":"value"}'
  $ fractary-core docs create guide-001 --title "User Guide" --content "..."

${chalk.bold('Documentation:')}
  Run ${chalk.cyan('fractary-core <command> --help')} for more information on a command.
`
);

// Show help if no command specified
if (process.argv.length === 2) {
  program.outputHelp();
  process.exit(0);
}

// Error handling
program.exitOverride();

async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error: any) {
    if (error.code === 'commander.help') {
      process.exit(0);
    }

    if (error.code === 'commander.unknownCommand') {
      console.error(chalk.red('Unknown command:'), error.message);
      console.log(
        chalk.gray('\nAvailable commands: config, work, repo, spec, logs, file, docs')
      );
      console.log(chalk.gray('Run "fractary-core --help" for more information.'));
      process.exit(1);
    }

    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

// Run CLI
main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
