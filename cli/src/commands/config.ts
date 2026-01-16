/**
 * Config command - Validate and display Fractary Core configuration
 *
 * Commands:
 * - validate: Validate .fractary/core/config.yaml
 * - show: Display config (redacted)
 */

import { Command } from 'commander';
import { loadConfig, getConfigPath, configExists } from '../utils/config.js';
import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { validateEnvVars, findProjectRoot } from '@fractary/core/common/yaml-config';

/**
 * Redact sensitive values from config for display
 */
function redactConfig(config: any): any {
  if (!config) return config;

  const redacted = JSON.parse(JSON.stringify(config));

  function redactObject(obj: any): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Redact values that look like tokens or contain ${ENV_VAR}
        if (
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('key') ||
          key.toLowerCase().includes('secret') ||
          key.toLowerCase().includes('password') ||
          obj[key].includes('${')
        ) {
          if (obj[key].includes('${')) {
            // Keep environment variable references
            obj[key] = obj[key];
          } else {
            // Redact actual values
            obj[key] = '********';
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        redactObject(obj[key]);
      }
    }
  }

  redactObject(redacted);
  return redacted;
}

/**
 * Validate configuration command
 */
async function validateCommand(options: { verbose?: boolean }): Promise<void> {
  try {
    const projectRoot = findProjectRoot();
    const configPath = getConfigPath(projectRoot);

    console.log(chalk.blue('🔍 Validating Fractary Core configuration\n'));
    console.log(chalk.gray(`Config file: ${configPath}\n`));

    // Check if config file exists
    if (!existsSync(configPath)) {
      console.log(chalk.red('❌ Configuration file not found'));
      console.log(chalk.yellow('\nTo create a configuration file, run:'));
      console.log(chalk.cyan('  fractary-core:configure'));
      process.exit(1);
    }

    // Check if it's a valid YAML file by trying to load it
    let config;
    try {
      config = loadConfig(projectRoot);
    } catch (error) {
      console.log(chalk.red('❌ Invalid YAML format'));
      console.log(
        chalk.yellow('\nError:'),
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }

    if (!config) {
      console.log(chalk.red('❌ Failed to load configuration'));
      process.exit(1);
    }

    // Validation checks
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check version field
    if (!config.version) {
      errors.push('Missing required field: version');
    } else if (config.version !== '2.0') {
      warnings.push(`Unexpected version: ${config.version} (expected: 2.0)`);
    }

    // Check for at least one plugin section
    const pluginSections = ['work', 'repo', 'logs', 'file', 'spec', 'docs'];
    const presentSections = pluginSections.filter((section) => config[section]);

    if (presentSections.length === 0) {
      warnings.push('No plugin sections found in configuration');
    }

    // Validate work section
    if (config.work) {
      if (!config.work.active_handler) {
        errors.push('Missing required field: work.active_handler');
      }
      if (!config.work.handlers) {
        errors.push('Missing required field: work.handlers');
      } else {
        const activeHandler = config.work.active_handler;
        if (!config.work.handlers[activeHandler]) {
          errors.push(
            `Configuration for work handler '${activeHandler}' not found in work.handlers`
          );
        }
      }
    }

    // Validate repo section
    if (config.repo) {
      if (!config.repo.active_handler) {
        errors.push('Missing required field: repo.active_handler');
      }
      if (!config.repo.handlers) {
        errors.push('Missing required field: repo.handlers');
      } else {
        const activeHandler = config.repo.active_handler;
        if (!config.repo.handlers[activeHandler]) {
          errors.push(
            `Configuration for repo handler '${activeHandler}' not found in repo.handlers`
          );
        }
      }
    }

    // Validate file section
    if (config.file) {
      if (!config.file.active_handler) {
        errors.push('Missing required field: file.active_handler');
      }
      if (!config.file.handlers) {
        errors.push('Missing required field: file.handlers');
      } else {
        const activeHandler = config.file.active_handler;
        if (!config.file.handlers[activeHandler]) {
          errors.push(
            `Configuration for file handler '${activeHandler}' not found in file.handlers`
          );
        }
      }
    }

    // Check for missing environment variables
    const missingEnvVars = validateEnvVars(config);
    if (missingEnvVars.length > 0) {
      warnings.push(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Display results
    console.log(chalk.bold('Validation Results:\n'));

    if (errors.length === 0 && warnings.length === 0) {
      console.log(chalk.green('✅ Configuration is valid'));
    } else {
      if (errors.length > 0) {
        console.log(chalk.red(`❌ ${errors.length} error(s) found:\n`));
        errors.forEach((error) => {
          console.log(chalk.red(`  • ${error}`));
        });
        console.log();
      }

      if (warnings.length > 0) {
        console.log(chalk.yellow(`⚠️  ${warnings.length} warning(s) found:\n`));
        warnings.forEach((warning) => {
          console.log(chalk.yellow(`  • ${warning}`));
        });
        console.log();
      }
    }

    // Display summary
    console.log(chalk.bold('Configuration Summary:\n'));
    console.log(chalk.gray(`  Version: ${config.version || 'not specified'}`));
    console.log(
      chalk.gray(`  Plugins configured: ${presentSections.join(', ') || 'none'}`)
    );

    if (config.work) {
      console.log(chalk.gray(`  Work platform: ${config.work.active_handler}`));
    }
    if (config.repo) {
      console.log(chalk.gray(`  Repo platform: ${config.repo.active_handler}`));
    }
    if (config.file) {
      console.log(chalk.gray(`  File storage: ${config.file.active_handler}`));
    }

    if (options.verbose) {
      console.log(chalk.gray('\nRaw configuration (redacted):'));
      console.log(JSON.stringify(redactConfig(config), null, 2));
    }

    if (errors.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('❌ Validation failed:'), error);
    process.exit(1);
  }
}

/**
 * Show configuration command
 */
async function showCommand(): Promise<void> {
  try {
    const projectRoot = findProjectRoot();
    const configPath = getConfigPath(projectRoot);

    if (!existsSync(configPath)) {
      console.log(chalk.red('❌ Configuration file not found'));
      console.log(chalk.yellow('\nTo create a configuration file, run:'));
      console.log(chalk.cyan('  fractary-core:configure'));
      process.exit(1);
    }

    const config = loadConfig(projectRoot);
    if (!config) {
      console.log(chalk.red('❌ Failed to load configuration'));
      process.exit(1);
    }

    console.log(chalk.blue('📋 Fractary Core Configuration\n'));
    console.log(chalk.gray(`Config file: ${configPath}\n`));

    const redacted = redactConfig(config);
    console.log(JSON.stringify(redacted, null, 2));
  } catch (error) {
    console.error(chalk.red('❌ Failed to display configuration:'), error);
    process.exit(1);
  }
}

/**
 * Register config command
 */
export function registerConfigCommand(program: Command): void {
  const config = program
    .command('config')
    .description('Manage Fractary Core configuration');

  config
    .command('validate')
    .description('Validate .fractary/core/config.yaml')
    .option('-v, --verbose', 'Show detailed output')
    .action(validateCommand);

  config
    .command('show')
    .description('Display configuration (with sensitive values redacted)')
    .action(showCommand);
}
