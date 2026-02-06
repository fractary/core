/**
 * Config command - Manage Fractary Core configuration
 *
 * Commands:
 * - configure: Initialize .fractary/config.yaml with defaults
 * - validate: Validate .fractary/core/config.yaml
 * - show: Display config (redacted)
 * - env-switch: Switch active environment
 * - env-list: List available environments
 * - env-show: Show current environment status
 * - env-clear: Clear environment credentials
 */

import { Command } from 'commander';
import { loadConfig, getConfigPath, configExists } from '../utils/config.js';
import chalk from 'chalk';
import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import {
  validateEnvVars,
  findProjectRoot,
  getDefaultConfig,
  getMinimalConfig,
  validateConfig,
  loadEnv,
  getCurrentEnv,
  switchEnv,
  clearEnv,
  type DefaultConfigOptions,
} from '@fractary/core/config';
import { redactConfig } from '@fractary/core/common/secrets';
import * as yaml from 'js-yaml';

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
      console.log(chalk.cyan('  fractary-core config configure'));
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
      console.log(chalk.cyan('  fractary-core config configure'));
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
 * Configure command options
 */
interface ConfigureOptions {
  workPlatform?: 'github' | 'jira' | 'linear';
  fileHandler?: 'local' | 's3';
  owner?: string;
  repo?: string;
  s3Bucket?: string;
  awsRegion?: string;
  minimal?: boolean;
  force?: boolean;
}

/**
 * Configure (initialize) configuration command
 */
async function configureCommand(options: ConfigureOptions): Promise<void> {
  try {
    const projectRoot = findProjectRoot();
    const configPath = getConfigPath(projectRoot);

    console.log(chalk.blue('Configuring Fractary Core\n'));

    // Check if config already exists
    if (existsSync(configPath) && !options.force) {
      console.log(chalk.yellow('Configuration file already exists:'));
      console.log(chalk.gray(`  ${configPath}\n`));
      console.log(chalk.yellow('Use --force to overwrite.'));
      process.exit(1);
    }

    // Build config options
    const configOptions: DefaultConfigOptions = {
      workPlatform: options.workPlatform || 'github',
      repoPlatform: 'github',
      fileHandler: options.fileHandler || 'local',
      owner: options.owner,
      repo: options.repo,
      s3Bucket: options.s3Bucket,
      awsRegion: options.awsRegion,
    };

    // Generate configuration
    const config = options.minimal
      ? getMinimalConfig(configOptions)
      : getDefaultConfig(configOptions);

    // Validate before writing
    const validation = validateConfig(config);
    if (!validation.valid) {
      console.log(chalk.red('Generated configuration is invalid:\n'));
      validation.errors.forEach((error) => {
        console.log(chalk.red(`  ${error}`));
      });
      process.exit(1);
    }

    // Ensure directory exists
    const configDir = dirname(configPath);
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    // Write configuration with YAML formatting
    let yamlContent = yaml.dump(config, {
      indent: 2,
      lineWidth: 100,
      noRefs: true,
      sortKeys: false,
    });

    // Add helpful comments for merge options
    yamlContent = yamlContent.replace(
      /(\s+strategy: (?:squash|merge|rebase))/,
      '$1  # options: squash, merge, rebase'
    );

    writeFileSync(configPath, yamlContent, 'utf-8');

    console.log(chalk.green('Configuration created/updated successfully:\n'));
    console.log(chalk.gray(`  ${configPath}\n`));

    // Show summary
    console.log(chalk.bold('Configuration Summary:\n'));
    console.log(chalk.gray(`  Version: ${config.version}`));
    if (config.work) {
      console.log(chalk.gray(`  Work platform: ${config.work.active_handler}`));
    }
    if (config.repo) {
      console.log(chalk.gray(`  Repo platform: ${config.repo.active_handler}`));
    }
    if (config.file) {
      const fileType = config.file.handlers?.specs?.type || 'local';
      console.log(chalk.gray(`  File storage: ${fileType}`));
    }

    if (validation.warnings.length > 0) {
      console.log(chalk.yellow('\nWarnings:'));
      validation.warnings.forEach((warning) => {
        console.log(chalk.yellow(`  ${warning}`));
      });
    }

    console.log(chalk.cyan('\nNext steps:'));
    console.log(chalk.gray('  1. Review and customize the configuration'));
    console.log(chalk.gray('  2. Set required environment variables (e.g., GITHUB_TOKEN)'));
    console.log(chalk.gray('  3. Run `fractary-core config validate` to verify'));
  } catch (error) {
    console.error(chalk.red('Failed to configure:'), error);
    process.exit(1);
  }
}

/**
 * Environment switch command
 */
async function envSwitchCommand(envName: string, options: { clear?: boolean }): Promise<void> {
  try {
    if (!envName) {
      console.error(chalk.red('Error: Environment name is required'));
      console.log(chalk.gray('\nUsage: fractary-core config env-switch <name>'));
      console.log(chalk.gray('Example: fractary-core config env-switch prod'));
      process.exit(1);
    }

    // Validate environment name
    if (!/^[a-zA-Z0-9_-]+$/.test(envName)) {
      console.error(chalk.red(`Error: Invalid environment name '${envName}'`));
      console.log(chalk.gray('\nEnvironment names can only contain letters, numbers, dashes, and underscores.'));
      process.exit(1);
    }

    // Clear credentials first if requested
    if (options.clear) {
      console.log(chalk.yellow('Clearing previous environment credentials...'));
      clearEnv();
    }

    // Check if .env.{envName} exists
    const projectRoot = findProjectRoot();
    const envFilePath = join(projectRoot, `.env.${envName}`);
    if (!existsSync(envFilePath)) {
      console.log(chalk.yellow(`Warning: .env.${envName} not found in project root`));
      console.log(chalk.gray('Will load: .env → .env.local (if exists)\n'));
    }

    // Perform the switch
    const success = switchEnv(envName);

    if (success) {
      console.log(chalk.green(`\nEnvironment switched to: ${envName}`));
      console.log(chalk.gray(`FRACTARY_ENV=${envName}`));
    } else {
      console.error(chalk.red('Failed to switch environment'));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Failed to switch environment:'), error);
    process.exit(1);
  }
}

/**
 * Environment list command
 */
async function envListCommand(): Promise<void> {
  try {
    const projectRoot = findProjectRoot();
    const currentEnvName = getCurrentEnv() || process.env.FRACTARY_ENV;

    console.log(chalk.blue('Available environments:\n'));

    // Scan for .env files
    const files = readdirSync(projectRoot).filter(
      (f) => f.startsWith('.env') && f !== '.env.example' && f !== '.env.local'
    );

    const envs: { name: string; file: string; exists: boolean }[] = [];

    // Always show base .env
    envs.push({
      name: '(default)',
      file: '.env',
      exists: existsSync(join(projectRoot, '.env')),
    });

    // Find named environments
    for (const file of files) {
      if (file === '.env') continue;
      const envName = file.replace('.env.', '');
      envs.push({
        name: envName,
        file: file,
        exists: true,
      });
    }

    // Display
    console.log(chalk.gray('  Name            File                Status'));
    console.log(chalk.gray('  ──────────────────────────────────────────────'));

    for (const env of envs) {
      const isCurrent = env.name === currentEnvName || (env.name === '(default)' && !currentEnvName);
      const marker = isCurrent ? chalk.green(' *') : '  ';
      const status = env.exists ? chalk.green('exists') : chalk.red('not found');
      const name = env.name.padEnd(16);
      const file = env.file.padEnd(20);
      console.log(`${marker}${name}${file}${status}`);
    }

    console.log();
    console.log(chalk.gray(`Current environment: ${currentEnvName || '(default)'}`));
    console.log(chalk.gray('\nSwitch with: fractary-core config env-switch <name>'));
  } catch (error) {
    console.error(chalk.red('Failed to list environments:'), error);
    process.exit(1);
  }
}

/**
 * Environment show command
 */
async function envShowCommand(): Promise<void> {
  try {
    const currentEnvName = getCurrentEnv() || process.env.FRACTARY_ENV;

    console.log(chalk.blue('Current environment status:\n'));
    console.log(chalk.gray(`  FRACTARY_ENV: ${currentEnvName || '(not set - using default)'}`));
    console.log();

    // Show credential status (masked)
    const credVars = [
      'GITHUB_TOKEN',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_DEFAULT_REGION',
      'JIRA_URL',
      'JIRA_EMAIL',
      'JIRA_TOKEN',
      'LINEAR_API_KEY',
    ];

    console.log(chalk.gray('  Credential status:'));
    for (const varName of credVars) {
      const value = process.env[varName];
      if (value) {
        // Mask the value
        let masked: string;
        if (varName.includes('SECRET') || varName.includes('TOKEN') || varName.includes('KEY')) {
          masked = chalk.green('set');
        } else {
          masked = value.length > 8 ? value.slice(0, 4) + '****' : chalk.green('set');
        }
        console.log(chalk.gray(`    ${varName.padEnd(28)}`) + chalk.green('✓ ') + masked);
      } else {
        console.log(chalk.gray(`    ${varName.padEnd(28)}`) + chalk.red('✗ not set'));
      }
    }

    console.log();
    console.log(chalk.gray('Switch with: fractary-core config env-switch <name>'));
    console.log(chalk.gray('List available: fractary-core config env-list'));
  } catch (error) {
    console.error(chalk.red('Failed to show environment:'), error);
    process.exit(1);
  }
}

/**
 * Environment clear command
 */
async function envClearCommand(options: { vars?: string }): Promise<void> {
  try {
    if (options.vars) {
      const varList = options.vars.split(',').map((v) => v.trim());
      clearEnv(varList);
      console.log(chalk.green(`Cleared ${varList.length} environment variable(s)`));
    } else {
      clearEnv();
      console.log(chalk.green('Cleared all Fractary environment credentials'));
    }
    console.log(chalk.gray('\nCurrent environment reset to default.'));
  } catch (error) {
    console.error(chalk.red('Failed to clear environment:'), error);
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
    .command('configure')
    .description('Initialize or update .fractary/config.yaml')
    .option('--work-platform <platform>', 'Work tracking platform (github|jira|linear)', 'github')
    .option('--file-handler <handler>', 'File storage handler (local|s3)', 'local')
    .option('--owner <owner>', 'GitHub/GitLab owner/organization')
    .option('--repo <repo>', 'Repository name')
    .option('--s3-bucket <bucket>', 'S3 bucket name (if using S3)')
    .option('--aws-region <region>', 'AWS region (if using S3)', 'us-east-1')
    .option('--minimal', 'Create minimal config (work + repo only)')
    .option('--force', 'Overwrite existing configuration')
    .action(configureCommand);

  config
    .command('validate')
    .description('Validate .fractary/core/config.yaml')
    .option('-v, --verbose', 'Show detailed output')
    .action(validateCommand);

  config
    .command('show')
    .description('Display configuration (with sensitive values redacted)')
    .action(showCommand);

  config
    .command('env-switch')
    .description('Switch to a different environment')
    .argument('<name>', 'Environment name (e.g., test, staging, prod)')
    .option('--clear', 'Clear credentials before switching')
    .action(envSwitchCommand);

  config
    .command('env-list')
    .description('List available environments')
    .action(envListCommand);

  config
    .command('env-show')
    .description('Show current environment status')
    .action(envShowCommand);

  config
    .command('env-clear')
    .description('Clear environment credentials')
    .option('--vars <vars>', 'Comma-separated list of specific variables to clear')
    .action(envClearCommand);
}
