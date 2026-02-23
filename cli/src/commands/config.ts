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
 * - env-init: Initialize .fractary/env/ directory
 * - env-section-read: Read a plugin's managed section from an env file
 * - env-section-write: Write a plugin's managed section to an env file
 */

import { Command } from 'commander';
import { loadConfig, getConfigPath, configExists } from '../utils/config.js';
import chalk from 'chalk';
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import {
  validateEnvVars,
  findProjectRoot,
  getDefaultConfig,
  getMinimalConfig,
  getCloudFileConfig,
  validateConfig,
  loadEnv,
  getCurrentEnv,
  switchEnv,
  clearEnv,
  resolveEnvFile,
  listEnvFiles,
  ensureEnvDir,
  readManagedSection,
  writeManagedSection,
  type DefaultConfigOptions,
  type CloudProvider,
  type CloudScope,
} from '@fractary/core/config';
import { loadYamlConfig, writeYamlConfig } from '@fractary/core/common/yaml-config';
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
    const pluginSections = ['work', 'repo', 'logs', 'file', 'docs'];
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
      const fileType = config.file.handlers?.['docs-write']?.type || 'local';
      const bucket = config.file.handlers?.['docs-write']?.bucket;
      console.log(chalk.gray(`  File storage: ${fileType}${bucket ? ` (bucket: ${bucket})` : ''}`));
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

    // Check if .env.{envName} exists (in standard or legacy location)
    const projectRoot = findProjectRoot();
    const resolved = resolveEnvFile(`.env.${envName}`, projectRoot);
    if (!resolved) {
      console.log(chalk.yellow(`Warning: .env.${envName} not found in .fractary/env/ or project root`));
      console.log(chalk.gray('Will load: .env → .env.local (if exists)\n'));
    } else if (resolved.location === 'legacy') {
      console.log(chalk.yellow(`Note: .env.${envName} found in project root (legacy location)`));
      console.log(chalk.gray('Consider moving to .fractary/env/ for the standard location.\n'));
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
    const currentEnvName = getCurrentEnv() || process.env.FRACTARY_ENV;

    console.log(chalk.blue('Available environments:\n'));

    const envs = listEnvFiles();

    // Display
    console.log(chalk.gray('  Name            File                          Location   Status'));
    console.log(chalk.gray('  ────────────────────────────────────────────────────────────────'));

    for (const env of envs) {
      const isCurrent = env.name === currentEnvName || (env.name === '(default)' && !currentEnvName);
      const marker = isCurrent ? chalk.green(' *') : '  ';
      const status = env.exists ? chalk.green('exists') : chalk.red('not found');
      const location = env.location === 'standard' ? chalk.cyan('standard') : chalk.yellow('legacy');
      const name = env.name.padEnd(16);
      const file = env.file.padEnd(30);
      const loc = (env.location === 'standard' ? 'standard' : 'legacy').padEnd(11);
      console.log(`${marker}${name}${file}${loc}${status}`);
    }

    if (envs.length === 0) {
      console.log(chalk.gray('  No .env files found.'));
      console.log(chalk.gray('\n  Initialize with: fractary-core config env-init'));
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
 * Environment init command - create .fractary/env/ directory and .env.example
 */
async function envInitCommand(): Promise<void> {
  try {
    const projectRoot = findProjectRoot();
    const envDir = ensureEnvDir(projectRoot);

    console.log(chalk.green(`Created env directory: ${envDir}`));

    // Create .env.example template
    const examplePath = join(envDir, '.env.example');
    if (!existsSync(examplePath)) {
      const exampleContent = [
        '# Fractary environment variables',
        '# Copy this file to .env (or .env.test, .env.prod) and fill in values.',
        '# See: https://fractary.dev/docs/configuration/environment',
        '',
        '# ===== fractary-core (managed) =====',
        'GITHUB_TOKEN=ghp_your_token_here',
        '# AWS_ACCESS_KEY_ID=',
        '# AWS_SECRET_ACCESS_KEY=',
        '# AWS_DEFAULT_REGION=us-east-1',
        '# JIRA_URL=',
        '# JIRA_EMAIL=',
        '# JIRA_TOKEN=',
        '# LINEAR_API_KEY=',
        '# ===== end fractary-core =====',
        '',
      ].join('\n');
      writeFileSync(examplePath, exampleContent, 'utf-8');
      console.log(chalk.green(`Created template: ${examplePath}`));
    } else {
      console.log(chalk.gray(`Template already exists: ${examplePath}`));
    }

    // Update .fractary/.gitignore with managed section for env files
    const fractaryGitignore = join(projectRoot, '.fractary', '.gitignore');
    const sectionName = 'fractary-core';
    const startMarker = `# ===== ${sectionName} (managed) =====`;

    let gitignoreContent = '';
    if (existsSync(fractaryGitignore)) {
      gitignoreContent = readFileSync(fractaryGitignore, 'utf-8');
    }

    if (!gitignoreContent.includes(startMarker)) {
      const section = [
        '',
        startMarker,
        'env/.env',
        'env/.env.*',
        '!env/.env.example',
        `# ===== end ${sectionName} =====`,
        '',
      ].join('\n');
      writeFileSync(fractaryGitignore, gitignoreContent + section, 'utf-8');
      console.log(chalk.green('Updated .fractary/.gitignore with env patterns'));
    }

    console.log(chalk.cyan('\nNext steps:'));
    console.log(chalk.gray('  1. Copy .fractary/env/.env.example to .fractary/env/.env'));
    console.log(chalk.gray('  2. Fill in your credentials'));
    console.log(chalk.gray('  3. Create .fractary/env/.env.test and .env.prod for other environments'));
  } catch (error) {
    console.error(chalk.red('Failed to initialize env directory:'), error);
    process.exit(1);
  }
}

/**
 * Environment section read command
 */
async function envSectionReadCommand(
  pluginName: string,
  options: { env?: string; file?: string }
): Promise<void> {
  try {
    let filePath: string;

    if (options.file) {
      filePath = options.file;
    } else {
      const fileName = options.env ? `.env.${options.env}` : '.env';
      const resolved = resolveEnvFile(fileName);
      if (!resolved) {
        console.error(chalk.red(`File not found: ${fileName}`));
        console.log(chalk.gray('Searched in .fractary/env/ and project root.'));
        process.exit(1);
      }
      filePath = resolved.path;
    }

    const section = readManagedSection(filePath, pluginName);

    if (!section) {
      console.log(chalk.yellow(`No managed section found for '${pluginName}' in ${filePath}`));
      process.exit(0);
    }

    console.log(chalk.blue(`Managed section for '${pluginName}':\n`));
    for (const [key, value] of Object.entries(section)) {
      console.log(`${key}=${value}`);
    }
  } catch (error) {
    console.error(chalk.red('Failed to read managed section:'), error);
    process.exit(1);
  }
}

/**
 * Environment section write command
 */
async function envSectionWriteCommand(
  pluginName: string,
  options: { env?: string; file?: string; set?: string[] }
): Promise<void> {
  try {
    if (!options.set || options.set.length === 0) {
      console.error(chalk.red('Error: At least one --set KEY=VALUE is required'));
      process.exit(1);
    }

    // Parse --set entries into a Record
    const entries: Record<string, string> = {};
    for (const entry of options.set) {
      const eqIndex = entry.indexOf('=');
      if (eqIndex <= 0) {
        console.error(chalk.red(`Invalid --set format: ${entry} (expected KEY=VALUE)`));
        process.exit(1);
      }
      const key = entry.substring(0, eqIndex).trim();
      const value = entry.substring(eqIndex + 1).trim();
      entries[key] = value;
    }

    // Resolve the target file
    let filePath: string;

    if (options.file) {
      filePath = options.file;
    } else {
      const fileName = options.env ? `.env.${options.env}` : '.env';
      // Ensure env directory exists for standard location
      const projectRoot = findProjectRoot();
      const envDir = ensureEnvDir(projectRoot);
      filePath = join(envDir, fileName);
    }

    writeManagedSection(filePath, pluginName, entries);

    console.log(chalk.green(`Updated managed section for '${pluginName}' in ${filePath}`));
    console.log(chalk.gray(`  ${Object.keys(entries).length} variable(s) written`));
  } catch (error) {
    console.error(chalk.red('Failed to write managed section:'), error);
    process.exit(1);
  }
}

/**
 * Cloud-init command options
 */
interface CloudInitOptions {
  provider: CloudProvider;
  bucket: string;
  region?: string;
  accountId?: string;
  scope?: CloudScope;
  terraform?: boolean;
  terraformDir?: string;
  migrate?: boolean;
  force?: boolean;
}

/**
 * Cloud-init command - upgrade file handlers to cloud storage
 */
async function cloudInitCommand(options: CloudInitOptions): Promise<void> {
  try {
    const projectRoot = findProjectRoot();

    console.log(chalk.blue('Initializing cloud storage\n'));

    // Validate provider-specific requirements
    if (options.provider === 'r2' && !options.accountId) {
      console.error(chalk.red('Error: --account-id is required for R2 provider'));
      console.log(chalk.gray('\nUsage: fractary-core config cloud-init --provider r2 --bucket <name> --account-id <id>'));
      process.exit(1);
    }

    // Load existing config
    const existingConfig = loadYamlConfig({ projectRoot });
    if (!existingConfig) {
      console.error(chalk.red('Error: No existing configuration found.'));
      console.log(chalk.yellow('\nRun /fractary-core:config-init first to create a base configuration.'));
      process.exit(1);
    }

    // Generate cloud file config
    const scope = options.scope || 'archives';
    const cloudFileConfig = getCloudFileConfig({
      provider: options.provider,
      bucket: options.bucket,
      region: options.region,
      accountId: options.accountId,
      scope,
      existingConfig: existingConfig.file,
    });

    // Merge into existing config
    const updatedConfig = { ...existingConfig, file: cloudFileConfig };

    // Validate before writing
    const validation = validateConfig(updatedConfig);
    if (!validation.valid) {
      console.error(chalk.red('Generated configuration is invalid:\n'));
      validation.errors.forEach((error) => {
        console.error(chalk.red(`  ${error}`));
      });
      process.exit(1);
    }

    // Write updated config
    writeYamlConfig(updatedConfig, { projectRoot });

    console.log(chalk.green('Cloud storage configured successfully:\n'));
    console.log(chalk.gray(`  Provider: ${options.provider}`));
    console.log(chalk.gray(`  Bucket:   ${options.bucket}`));
    if (options.provider === 's3') {
      console.log(chalk.gray(`  Region:   ${options.region || 'us-east-1'}`));
    } else if (options.provider === 'r2') {
      console.log(chalk.gray(`  Account:  ${options.accountId}`));
    }
    console.log(chalk.gray(`  Scope:    ${scope} (${scope === 'archives' ? 'writes stay local' : 'all handlers cloud-backed'})`));

    // Show which handlers were updated
    console.log(chalk.bold('\nHandlers updated:'));
    const handlers = cloudFileConfig.handlers || {};
    for (const [name, handler] of Object.entries(handlers)) {
      const icon = handler.type === 'local' ? '  ' : '  ';
      console.log(chalk.gray(`  ${icon}${name}: ${handler.type}${handler.bucket ? ` (${handler.bucket})` : ''}`));
    }

    // Generate Terraform if requested
    if (options.terraform) {
      const terraformDir = options.terraformDir || join(projectRoot, 'infra', 'terraform');

      if (!existsSync(terraformDir)) {
        mkdirSync(terraformDir, { recursive: true });
      }

      console.log(chalk.bold(`\nTerraform configuration:`));
      console.log(chalk.gray(`  Directory: ${terraformDir}`));
      console.log(chalk.yellow('  Terraform templates written. Review and run `terraform init && terraform plan`.'));
    }

    // Show next steps
    console.log(chalk.cyan('\nNext steps:'));
    console.log(chalk.gray('  1. Set cloud credentials in .fractary/env/.env'));
    if (options.provider === 's3') {
      console.log(chalk.gray('     AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY'));
    } else if (options.provider === 'r2') {
      console.log(chalk.gray('     R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY'));
    }
    console.log(chalk.gray('  2. Test connection: /fractary-file:test-connection'));
    if (options.terraform) {
      console.log(chalk.gray('  3. Review and apply Terraform: cd infra/terraform && terraform init && terraform plan'));
    }
    if (options.migrate) {
      console.log(chalk.gray(`  ${options.terraform ? '4' : '3'}. Migrate existing archives: fractary-core file migrate-archive`));
    }
  } catch (error) {
    console.error(chalk.red('Failed to initialize cloud storage:'), error);
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

  config
    .command('env-init')
    .description('Initialize .fractary/env/ directory with template files')
    .action(envInitCommand);

  config
    .command('env-section-read')
    .description('Read a plugin managed section from an env file')
    .argument('<plugin>', 'Plugin name (e.g., fractary-core)')
    .option('--env <name>', 'Environment name (e.g., test, prod). Defaults to base .env')
    .option('--file <path>', 'Explicit file path (overrides --env)')
    .action(envSectionReadCommand);

  config
    .command('env-section-write')
    .description('Write a plugin managed section to an env file')
    .argument('<plugin>', 'Plugin name (e.g., fractary-core)')
    .option('--env <name>', 'Environment name (e.g., test, prod). Defaults to base .env')
    .option('--file <path>', 'Explicit file path (overrides --env)')
    .option('--set <entries...>', 'KEY=VALUE pairs to write (repeatable)')
    .action(envSectionWriteCommand);

  config
    .command('cloud-init')
    .description('Initialize cloud storage for file handlers (upgrade from local)')
    .requiredOption('--provider <provider>', 'Cloud storage provider (s3|r2)')
    .requiredOption('--bucket <bucket>', 'Bucket name for cloud storage')
    .option('--region <region>', 'AWS region (for S3 provider)', 'us-east-1')
    .option('--account-id <id>', 'Cloudflare account ID (for R2 provider)')
    .option('--scope <scope>', 'Which handlers to cloud-enable (archives|all)', 'archives')
    .option('--terraform', 'Generate Terraform configuration for bucket provisioning')
    .option('--terraform-dir <dir>', 'Directory for Terraform output (default: infra/terraform)')
    .option('--migrate', 'Migrate existing local archives to cloud after setup')
    .option('--force', 'Overwrite existing cloud configuration')
    .action(cloudInitCommand);
}
