/**
 * File subcommand - File storage operations
 *
 * Provides file operations via @fractary/core FileManager.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getFileManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

/**
 * Create the file command tree
 */
export function createFileCommand(): Command {
  const file = new Command('file').description('File storage operations');

  file.addCommand(createFileWriteCommand());
  file.addCommand(createFileReadCommand());
  file.addCommand(createFileExistsCommand());
  file.addCommand(createFileListCommand());
  file.addCommand(createFileDeleteCommand());
  file.addCommand(createFileCopyCommand());
  file.addCommand(createFileMoveCommand());

  return file;
}

function createFileWriteCommand(): Command {
  return new Command('write')
    .description('Write file content')
    .argument('<path>', 'File path')
    .requiredOption('--content <text>', 'File content')
    .option('--json', 'Output as JSON')
    .action(async (filePath: string, options) => {
      try {
        const fileManager = await getFileManager();
        const result = await fileManager.write(filePath, options.content);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: { path: result } }, null, 2));
        } else {
          console.log(chalk.green(`✓ Wrote file: ${result}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createFileReadCommand(): Command {
  return new Command('read')
    .description('Read file content')
    .argument('<path>', 'File path')
    .option('--json', 'Output as JSON')
    .action(async (filePath: string, options) => {
      try {
        const fileManager = await getFileManager();
        const content = await fileManager.read(filePath);

        if (content === null) {
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

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: { path: filePath, content } }, null, 2));
        } else {
          console.log(content);
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createFileExistsCommand(): Command {
  return new Command('exists')
    .description('Check if file exists')
    .argument('<path>', 'File path')
    .option('--json', 'Output as JSON')
    .action(async (filePath: string, options) => {
      try {
        const fileManager = await getFileManager();
        const exists = await fileManager.exists(filePath);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: { path: filePath, exists } }, null, 2));
        } else {
          if (exists) {
            console.log(chalk.green(`✓ File exists: ${filePath}`));
          } else {
            console.log(chalk.yellow(`File does not exist: ${filePath}`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createFileListCommand(): Command {
  return new Command('list')
    .description('List files')
    .option('--prefix <prefix>', 'Filter by prefix')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const fileManager = await getFileManager();
        const files = await fileManager.list(options.prefix);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: files }, null, 2));
        } else {
          if (files.length === 0) {
            console.log(chalk.yellow('No files found'));
          } else {
            files.forEach((file: string) => {
              console.log(`  ${file}`);
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createFileDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete a file')
    .argument('<path>', 'File path')
    .option('--json', 'Output as JSON')
    .action(async (filePath: string, options) => {
      try {
        const fileManager = await getFileManager();
        await fileManager.delete(filePath);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: { path: filePath } }, null, 2));
        } else {
          console.log(chalk.green(`✓ Deleted file: ${filePath}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createFileCopyCommand(): Command {
  return new Command('copy')
    .description('Copy a file')
    .argument('<source>', 'Source path')
    .argument('<destination>', 'Destination path')
    .option('--json', 'Output as JSON')
    .action(async (source: string, destination: string, options) => {
      try {
        const fileManager = await getFileManager();
        const result = await fileManager.copy(source, destination);

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'success',
                data: { source, destination: result },
              },
              null,
              2
            )
          );
        } else {
          console.log(chalk.green(`✓ Copied file: ${source} → ${result}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createFileMoveCommand(): Command {
  return new Command('move')
    .description('Move a file')
    .argument('<source>', 'Source path')
    .argument('<destination>', 'Destination path')
    .option('--json', 'Output as JSON')
    .action(async (source: string, destination: string, options) => {
      try {
        const fileManager = await getFileManager();
        const result = await fileManager.move(source, destination);

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'success',
                data: { source, destination: result },
              },
              null,
              2
            )
          );
        } else {
          console.log(chalk.green(`✓ Moved file: ${source} → ${result}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
