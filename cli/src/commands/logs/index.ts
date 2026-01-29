/**
 * Logs subcommand - Log management
 *
 * Provides capture, write, search, list, archive operations via @fractary/core LogManager.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getLogManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';
import { getTypeColor } from './utils';

/**
 * Create the logs command tree
 */
export function createLogsCommand(): Command {
  const logs = new Command('logs').description('Log management');

  // Type management commands (new)
  logs.addCommand(createLogsTypesCommand());
  logs.addCommand(createLogsTypeInfoCommand());
  logs.addCommand(createLogsValidateCommand());

  // Existing commands
  logs.addCommand(createLogsCaptureCommand());
  logs.addCommand(createLogsStopCommand());
  logs.addCommand(createLogsWriteCommand());
  logs.addCommand(createLogsReadCommand());
  logs.addCommand(createLogsSearchCommand());
  logs.addCommand(createLogsListCommand());
  logs.addCommand(createLogsArchiveCommand());
  logs.addCommand(createLogsDeleteCommand());

  return logs;
}

// =============================================================================
// Type Management Commands
// =============================================================================

function createLogsTypesCommand(): Command {
  return new Command('types')
    .description('List available log types')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const logManager = await getLogManager();
        const types = logManager.getLogTypes();

        if (options.json) {
          const typeList = types.map((t) => ({
            id: t.id,
            display_name: t.displayName,
            description: t.description,
            output_path: t.outputPath,
          }));
          console.log(JSON.stringify({ status: 'success', data: typeList }, null, 2));
        } else {
          console.log(chalk.bold('Available log types:\n'));
          types.forEach((type) => {
            const colorFn = getTypeColor(type.id);
            console.log(colorFn(`  ${type.id.padEnd(12)}`), chalk.gray(type.description));
          });
          console.log(chalk.gray(`\nTotal: ${types.length} types`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createLogsTypeInfoCommand(): Command {
  return new Command('type-info')
    .description('Get log type definition')
    .argument('<type>', 'Log type ID')
    .option('--json', 'Output as JSON')
    .action(async (typeId: string, options) => {
      try {
        const logManager = await getLogManager();
        const type = logManager.getLogType(typeId);

        if (!type) {
          if (options.json) {
            console.error(
              JSON.stringify(
                {
                  status: 'error',
                  error: { code: 'TYPE_NOT_FOUND', message: `Log type not found: ${typeId}` },
                },
                null,
                2
              )
            );
          } else {
            console.error(chalk.red(`Log type not found: ${typeId}`));
            console.log(chalk.gray('\nRun "fractary-core logs types" to see available types.'));
          }
          process.exit(3);
        }

        if (options.json) {
          // Convert to snake_case for JSON output
          const jsonType = {
            id: type.id,
            display_name: type.displayName,
            description: type.description,
            output_path: type.outputPath,
            file_naming: {
              pattern: type.fileNaming.pattern,
              date_format: type.fileNaming.dateFormat,
              slug_source: type.fileNaming.slugSource,
              slug_max_length: type.fileNaming.slugMaxLength,
            },
            frontmatter: {
              required_fields: type.frontmatter.requiredFields,
              optional_fields: type.frontmatter.optionalFields,
              defaults: type.frontmatter.defaults,
            },
            structure: type.structure
              ? {
                  required_sections: type.structure.requiredSections,
                  optional_sections: type.structure.optionalSections,
                  section_order: type.structure.sectionOrder,
                }
              : undefined,
            status: type.status
              ? {
                  allowed_values: type.status.allowedValues,
                  default: type.status.default,
                }
              : undefined,
            severity: type.severity
              ? {
                  allowed_values: type.severity.allowedValues,
                  default: type.severity.default,
                }
              : undefined,
            retention: type.retention
              ? {
                  default_local_days: type.retention.defaultLocalDays,
                  default_cloud_days: type.retention.defaultCloudDays,
                }
              : undefined,
          };
          console.log(JSON.stringify({ status: 'success', data: jsonType }, null, 2));
        } else {
          const colorFn = getTypeColor(type.id);
          console.log(colorFn(chalk.bold(`${type.displayName} (${type.id})`)));
          console.log(chalk.gray(type.description));
          console.log();

          console.log(chalk.bold('Output Path:'), type.outputPath);
          console.log(chalk.bold('File Pattern:'), type.fileNaming.pattern);
          console.log();

          console.log(chalk.bold('Frontmatter:'));
          console.log(chalk.green('  Required:'), type.frontmatter.requiredFields.join(', '));
          if (type.frontmatter.optionalFields?.length) {
            console.log(chalk.gray('  Optional:'), type.frontmatter.optionalFields.join(', '));
          }
          console.log();

          if (type.structure?.requiredSections?.length) {
            console.log(chalk.bold('Structure:'));
            console.log(chalk.green('  Required sections:'), type.structure.requiredSections.join(', '));
            if (type.structure.optionalSections?.length) {
              console.log(chalk.gray('  Optional sections:'), type.structure.optionalSections.join(', '));
            }
            console.log();
          }

          if (type.status) {
            console.log(chalk.bold('Status:'), type.status.allowedValues.join(' | '), chalk.gray(`(default: ${type.status.default})`));
          }

          if (type.severity) {
            console.log(chalk.bold('Severity:'), type.severity.allowedValues.join(' | '), chalk.gray(`(default: ${type.severity.default})`));
          }

          if (type.retention) {
            console.log(chalk.bold('Retention:'));
            console.log(`  Local: ${type.retention.defaultLocalDays === 'forever' ? 'forever' : `${type.retention.defaultLocalDays} days`}`);
            console.log(`  Cloud: ${type.retention.defaultCloudDays === 'forever' ? 'forever' : `${type.retention.defaultCloudDays} days`}`);
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createLogsValidateCommand(): Command {
  return new Command('validate')
    .description('Validate a log file against its type schema')
    .argument('<file>', 'Path to log file')
    .option('--log-type <type>', 'Override log type (auto-detected from frontmatter)')
    .option('--json', 'Output as JSON')
    .action(async (filePath: string, options) => {
      try {
        const fs = await import('fs');
        const path = await import('path');

        // Resolve file path
        const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

        if (!fs.existsSync(resolvedPath)) {
          if (options.json) {
            console.error(
              JSON.stringify(
                {
                  status: 'error',
                  error: { code: 'FILE_NOT_FOUND', message: `File not found: ${filePath}` },
                },
                null,
                2
              )
            );
          } else {
            console.error(chalk.red(`File not found: ${filePath}`));
          }
          process.exit(3);
        }

        let content: string;
        try {
          content = fs.readFileSync(resolvedPath, 'utf-8');
        } catch (readError) {
          const errorMessage = readError instanceof Error ? readError.message : 'Unknown error';
          if (options.json) {
            console.error(
              JSON.stringify(
                {
                  status: 'error',
                  error: { code: 'FILE_READ_ERROR', message: `Could not read file: ${errorMessage}` },
                },
                null,
                2
              )
            );
          } else {
            console.error(chalk.red(`Could not read file: ${errorMessage}`));
          }
          process.exit(3);
        }

        // Parse frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) {
          if (options.json) {
            console.error(
              JSON.stringify(
                {
                  status: 'error',
                  error: { code: 'NO_FRONTMATTER', message: 'File does not contain YAML frontmatter' },
                },
                null,
                2
              )
            );
          } else {
            console.error(chalk.red('File does not contain YAML frontmatter'));
          }
          process.exit(3);
        }

        // Parse frontmatter fields
        const frontmatter: Record<string, string> = {};
        for (const line of frontmatterMatch[1].split('\n')) {
          const match = line.match(/^(\w+):\s*(.*)$/);
          if (match) {
            frontmatter[match[1]] = match[2].replace(/^["']|["']$/g, '');
          }
        }

        // Determine log type
        const logTypeId = options.logType || frontmatter.log_type || frontmatter.type;
        if (!logTypeId) {
          if (options.json) {
            console.error(
              JSON.stringify(
                {
                  status: 'error',
                  error: { code: 'NO_TYPE', message: 'Could not determine log type. Use --log-type to specify.' },
                },
                null,
                2
              )
            );
          } else {
            console.error(chalk.red('Could not determine log type. Use --log-type to specify.'));
          }
          process.exit(3);
        }

        const logManager = await getLogManager();
        const typeDefinition = logManager.getLogType(logTypeId);

        if (!typeDefinition) {
          if (options.json) {
            console.error(
              JSON.stringify(
                {
                  status: 'error',
                  error: { code: 'UNKNOWN_TYPE', message: `Unknown log type: ${logTypeId}` },
                },
                null,
                2
              )
            );
          } else {
            console.error(chalk.red(`Unknown log type: ${logTypeId}`));
          }
          process.exit(3);
        }

        // Validate against type definition
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check required frontmatter fields
        for (const field of typeDefinition.frontmatter.requiredFields) {
          if (!frontmatter[field]) {
            errors.push(`Missing required field: ${field}`);
          }
        }

        // Check status value if defined
        if (typeDefinition.status && frontmatter.status) {
          if (!typeDefinition.status.allowedValues.includes(frontmatter.status)) {
            errors.push(`Invalid status "${frontmatter.status}". Allowed: ${typeDefinition.status.allowedValues.join(', ')}`);
          }
        }

        // Check severity value if defined
        if (typeDefinition.severity && frontmatter.severity) {
          if (!typeDefinition.severity.allowedValues.includes(frontmatter.severity)) {
            errors.push(`Invalid severity "${frontmatter.severity}". Allowed: ${typeDefinition.severity.allowedValues.join(', ')}`);
          }
        }

        // Check for required sections in body
        if (typeDefinition.structure?.requiredSections) {
          const body = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
          for (const section of typeDefinition.structure.requiredSections) {
            // Look for markdown headers matching section name
            const sectionPattern = new RegExp(`^##\\s+${section}`, 'mi');
            if (!sectionPattern.test(body)) {
              warnings.push(`Missing recommended section: ${section}`);
            }
          }
        }

        const isValid = errors.length === 0;

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'success',
                data: {
                  valid: isValid,
                  log_type: logTypeId,
                  file: resolvedPath,
                  errors,
                  warnings,
                },
              },
              null,
              2
            )
          );
        } else {
          if (isValid) {
            console.log(chalk.green(`✓ Valid ${logTypeId} log`));
            if (warnings.length > 0) {
              console.log(chalk.yellow('\nWarnings:'));
              warnings.forEach((w) => console.log(chalk.yellow(`  - ${w}`)));
            }
          } else {
            console.log(chalk.red(`✗ Invalid ${logTypeId} log`));
            console.log(chalk.red('\nErrors:'));
            errors.forEach((e) => console.log(chalk.red(`  - ${e}`)));
            if (warnings.length > 0) {
              console.log(chalk.yellow('\nWarnings:'));
              warnings.forEach((w) => console.log(chalk.yellow(`  - ${w}`)));
            }
            process.exit(1);
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

// =============================================================================
// Session Capture Commands
// =============================================================================

function createLogsCaptureCommand(): Command {
  return new Command('capture')
    .description('Start session capture')
    .argument('<issue_number>', 'Issue number to associate with session')
    .option('--model <model>', 'Model being used')
    .option('--json', 'Output as JSON')
    .action(async (issueNumber: string, options) => {
      try {
        const logManager = await getLogManager();
        const result = await logManager.startCapture({
          issueNumber: parseInt(issueNumber, 10),
          model: options.model,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          console.log(chalk.green(`✓ Started session capture for issue #${issueNumber}`));
          console.log(chalk.gray(`  Session ID: ${result.sessionId}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createLogsStopCommand(): Command {
  return new Command('stop')
    .description('Stop session capture')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const logManager = await getLogManager();
        const result = await logManager.stopCapture();

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          console.log(chalk.green('✓ Stopped session capture'));
          if (result?.logPath) {
            console.log(chalk.gray(`  Log saved to: ${result.logPath}`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createLogsWriteCommand(): Command {
  return new Command('write')
    .description('Write a log entry')
    .requiredOption('--type <type>', 'Log type (session, build, deployment, test, debug, audit, operational, workflow)')
    .requiredOption('--title <title>', 'Log title')
    .requiredOption('--content <text>', 'Log content')
    .option('--issue <number>', 'Associated issue number')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const logManager = await getLogManager();
        const log = await logManager.writeLog({
          type: options.type,
          title: options.title,
          content: options.content,
          issueNumber: options.issue ? parseInt(options.issue, 10) : undefined,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: log }, null, 2));
        } else {
          console.log(chalk.green(`✓ Wrote log entry`));
          console.log(chalk.gray(`  ID: ${log.id}`));
          console.log(chalk.gray(`  Type: ${log.type}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createLogsReadCommand(): Command {
  return new Command('read')
    .description('Read a log entry')
    .argument('<id>', 'Log ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const logManager = await getLogManager();
        const log = await logManager.readLog(id);

        if (!log) {
          if (options.json) {
            console.error(
              JSON.stringify(
                {
                  status: 'error',
                  error: { code: 'LOG_NOT_FOUND', message: `Log not found: ${id}` },
                },
                null,
                2
              )
            );
          } else {
            console.error(chalk.red(`Log not found: ${id}`));
          }
          process.exit(3);
        }

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: log }, null, 2));
        } else {
          const colorFn = getTypeColor(log.type);
          console.log(colorFn(chalk.bold(`[${log.type.toUpperCase()}] ${log.title}`)));
          console.log(chalk.gray(`ID: ${log.id}`));
          console.log(chalk.gray(`Timestamp: ${log.metadata.date}`));
          if (log.metadata.issue_number) {
            console.log(chalk.gray(`Issue: #${log.metadata.issue_number}`));
          }
          console.log('\n' + log.content);
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createLogsSearchCommand(): Command {
  return new Command('search')
    .description('Search logs')
    .requiredOption('--query <text>', 'Search query')
    .option('--type <type>', 'Filter by type')
    .option('--issue <number>', 'Filter by issue number')
    .option('--regex', 'Use regex for search')
    .option('--limit <n>', 'Limit results', '10')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const logManager = await getLogManager();
        const logs = logManager.searchLogs({
          query: options.query,
          type: options.type,
          issueNumber: options.issue ? parseInt(options.issue, 10) : undefined,
        });

        const limitedLogs = options.limit ? logs.slice(0, parseInt(options.limit, 10)) : logs;

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: limitedLogs }, null, 2));
        } else {
          if (limitedLogs.length === 0) {
            console.log(chalk.yellow('No logs found'));
          } else {
            limitedLogs.forEach((log: any) => {
              const colorFn = getTypeColor(log.type);
              console.log(colorFn(`[${log.type}] ${log.id}: ${log.title}`));
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createLogsListCommand(): Command {
  return new Command('list')
    .description('List logs')
    .option('--type <type>', 'Filter by type')
    .option('--status <status>', 'Filter by status')
    .option('--issue <number>', 'Filter by issue number')
    .option('--limit <n>', 'Limit results', '20')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const logManager = await getLogManager();
        const logs = await logManager.listLogs({
          type: options.type,
          status: options.status,
          issueNumber: options.issue ? parseInt(options.issue, 10) : undefined,
        });

        const limitedLogs = options.limit ? logs.slice(0, parseInt(options.limit, 10)) : logs;

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: limitedLogs }, null, 2));
        } else {
          if (limitedLogs.length === 0) {
            console.log(chalk.yellow('No logs found'));
          } else {
            limitedLogs.forEach((log: any) => {
              const colorFn = getTypeColor(log.type);
              console.log(colorFn(`[${log.type}] ${log.id}: ${log.title}`));
              console.log(chalk.gray(`  ${log.timestamp}`));
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createLogsArchiveCommand(): Command {
  return new Command('archive')
    .description('Archive old logs')
    .option('--max-age <days>', 'Archive logs older than N days', '90')
    .option('--compress', 'Compress archived logs')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const logManager = await getLogManager();
        const result = await logManager.archiveLogs({
          maxAgeDays: parseInt(options.maxAge, 10),
          compress: options.compress,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          console.log(chalk.green(`✓ Archived ${result.archived.length} logs`));
          if (result.deleted && result.deleted.length > 0) {
            console.log(chalk.gray(`  Deleted: ${result.deleted.length} old archives`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createLogsDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete a log entry')
    .argument('<id>', 'Log ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const logManager = await getLogManager();
        await logManager.deleteLog(id);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: { id } }, null, 2));
        } else {
          console.log(chalk.green(`✓ Deleted log: ${id}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
