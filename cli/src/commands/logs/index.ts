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
