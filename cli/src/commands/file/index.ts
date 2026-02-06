/**
 * File subcommand - File storage operations
 *
 * Commands use consistent naming to mirror plugin commands:
 * CLI: fractary-core file upload
 * Plugin: /fractary-file:upload
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'fs';
import { basename, dirname } from 'path';
import { createHash } from 'crypto';
import { getFileManager } from '../../sdk/factory';
import { handleError, CLIError } from '../../utils/errors';

/**
 * Helper to build FileManager options from --source flag
 */
function fileManagerOpts(options: { source?: string }) {
  return options.source ? { source: options.source } : undefined;
}

/**
 * Mask sensitive values in file configuration for display
 */
function maskFileConfig(config: any): any {
  const masked = JSON.parse(JSON.stringify(config));
  if (masked.sources) {
    for (const source of Object.values(masked.sources) as any[]) {
      if (source.auth) {
        for (const key of Object.keys(source.auth)) {
          if (key !== 'profile' && source.auth[key]) {
            source.auth[key] = '******';
          }
        }
      }
      if (source.accountId) source.accountId = '******';
    }
  }
  return masked;
}

/**
 * Create the file command tree
 */
export function createFileCommand(): Command {
  const file = new Command('file').description('File storage operations');

  // Core storage operations
  file.addCommand(createFileUploadCommand());
  file.addCommand(createFileDownloadCommand());
  file.addCommand(createFileWriteCommand());
  file.addCommand(createFileReadCommand());
  file.addCommand(createFileListCommand());
  file.addCommand(createFileDeleteCommand());
  file.addCommand(createFileExistsCommand());
  file.addCommand(createFileCopyCommand());
  file.addCommand(createFileMoveCommand());
  file.addCommand(createFileGetUrlCommand());

  // Configuration and diagnostics
  file.addCommand(createFileShowConfigCommand());
  file.addCommand(createFileTestConnectionCommand());

  return file;
}

function createFileUploadCommand(): Command {
  return new Command('upload')
    .description('Upload a local file to storage')
    .argument('<local-path>', 'Path to local file')
    .option('--remote-path <path>', 'Remote storage path (defaults to filename)')
    .option('--source <name>', 'Named source from config')
    .option('--json', 'Output as JSON')
    .action(async (localPath: string, options) => {
      try {
        if (!existsSync(localPath)) {
          throw new CLIError('NOT_FOUND', `Local file not found: ${localPath}`);
        }

        const content = readFileSync(localPath, 'utf-8');
        const stats = statSync(localPath);
        const checksum = createHash('sha256').update(content).digest('hex');
        const remotePath = options.remotePath || basename(localPath);
        const fileManager = await getFileManager(fileManagerOpts(options));
        const uri = await fileManager.write(remotePath, content);

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'success',
                data: {
                  source: options.source || 'default',
                  localPath,
                  remotePath,
                  url: uri,
                  sizeBytes: stats.size,
                  checksum: `sha256:${checksum}`,
                  uploadedAt: new Date().toISOString(),
                },
              },
              null,
              2
            )
          );
        } else {
          console.log(chalk.green(`✓ Uploaded: ${localPath} → ${remotePath}`));
          console.log(chalk.gray(`  Size: ${stats.size} bytes`));
          console.log(chalk.gray(`  Checksum: sha256:${checksum.substring(0, 16)}...`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createFileDownloadCommand(): Command {
  return new Command('download')
    .description('Download a file from storage to local path')
    .argument('<remote-path>', 'Remote storage path')
    .option('--local-path <path>', 'Local destination path (defaults to filename)')
    .option('--source <name>', 'Named source from config')
    .option('--json', 'Output as JSON')
    .action(async (remotePath: string, options) => {
      try {
        const fileManager = await getFileManager(fileManagerOpts(options));
        const content = await fileManager.read(remotePath);

        if (content === null) {
          throw new CLIError('NOT_FOUND', `Remote file not found: ${remotePath}`);
        }

        const localPath = options.localPath || basename(remotePath);
        const dir = dirname(localPath);
        if (dir !== '.' && !existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }

        writeFileSync(localPath, content);
        const stats = statSync(localPath);
        const checksum = createHash('sha256').update(content).digest('hex');

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'success',
                data: {
                  source: options.source || 'default',
                  remotePath,
                  localPath,
                  sizeBytes: stats.size,
                  checksum: `sha256:${checksum}`,
                  downloadedAt: new Date().toISOString(),
                },
              },
              null,
              2
            )
          );
        } else {
          console.log(chalk.green(`✓ Downloaded: ${remotePath} → ${localPath}`));
          console.log(chalk.gray(`  Size: ${stats.size} bytes`));
          console.log(chalk.gray(`  Checksum: sha256:${checksum.substring(0, 16)}...`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createFileWriteCommand(): Command {
  return new Command('write')
    .description('Write content to a storage path')
    .argument('<path>', 'Storage path')
    .requiredOption('--content <text>', 'Content to write')
    .option('--source <name>', 'Named source from config')
    .option('--json', 'Output as JSON')
    .action(async (filePath: string, options) => {
      try {
        const fileManager = await getFileManager(fileManagerOpts(options));
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
    .description('Read content from a storage path')
    .argument('<path>', 'Storage path')
    .option('--source <name>', 'Named source from config')
    .option('--json', 'Output as JSON')
    .action(async (filePath: string, options) => {
      try {
        const fileManager = await getFileManager(fileManagerOpts(options));
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
          console.log(
            JSON.stringify({ status: 'success', data: { path: filePath, content } }, null, 2)
          );
        } else {
          console.log(content);
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createFileListCommand(): Command {
  return new Command('list')
    .description('List files in storage')
    .option('--prefix <prefix>', 'Filter by prefix')
    .option('--source <name>', 'Named source from config')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const fileManager = await getFileManager(fileManagerOpts(options));
        const files = await fileManager.list(options.prefix);

        if (options.json) {
          console.log(
            JSON.stringify({ status: 'success', data: { files, count: files.length } }, null, 2)
          );
        } else {
          if (files.length === 0) {
            console.log(chalk.yellow('No files found'));
          } else {
            files.forEach((file: string) => {
              console.log(`  ${file}`);
            });
            console.log(chalk.gray(`\n${files.length} file(s) found`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createFileDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete a file from storage')
    .argument('<path>', 'Storage path')
    .option('--source <name>', 'Named source from config')
    .option('--json', 'Output as JSON')
    .action(async (filePath: string, options) => {
      try {
        const fileManager = await getFileManager(fileManagerOpts(options));
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

function createFileExistsCommand(): Command {
  return new Command('exists')
    .description('Check if a file exists in storage')
    .argument('<path>', 'Storage path')
    .option('--source <name>', 'Named source from config')
    .option('--json', 'Output as JSON')
    .action(async (filePath: string, options) => {
      try {
        const fileManager = await getFileManager(fileManagerOpts(options));
        const exists = await fileManager.exists(filePath);

        if (options.json) {
          console.log(
            JSON.stringify({ status: 'success', data: { path: filePath, exists } }, null, 2)
          );
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

function createFileCopyCommand(): Command {
  return new Command('copy')
    .description('Copy a file within storage')
    .argument('<src-path>', 'Source path')
    .argument('<dest-path>', 'Destination path')
    .option('--source <name>', 'Named source from config')
    .option('--json', 'Output as JSON')
    .action(async (srcPath: string, destPath: string, options) => {
      try {
        const fileManager = await getFileManager(fileManagerOpts(options));
        const result = await fileManager.copy(srcPath, destPath);

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'success',
                data: { source: srcPath, destination: result },
              },
              null,
              2
            )
          );
        } else {
          console.log(chalk.green(`✓ Copied file: ${srcPath} → ${result}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createFileMoveCommand(): Command {
  return new Command('move')
    .description('Move a file within storage')
    .argument('<src-path>', 'Source path')
    .argument('<dest-path>', 'Destination path')
    .option('--source <name>', 'Named source from config')
    .option('--json', 'Output as JSON')
    .action(async (srcPath: string, destPath: string, options) => {
      try {
        const fileManager = await getFileManager(fileManagerOpts(options));
        const result = await fileManager.move(srcPath, destPath);

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'success',
                data: { source: srcPath, destination: result },
              },
              null,
              2
            )
          );
        } else {
          console.log(chalk.green(`✓ Moved file: ${srcPath} → ${result}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createFileGetUrlCommand(): Command {
  return new Command('get-url')
    .description('Get a URL for a file in storage')
    .argument('<path>', 'Storage path')
    .option('--expires-in <seconds>', 'URL expiration in seconds')
    .option('--source <name>', 'Named source from config')
    .option('--json', 'Output as JSON')
    .action(async (filePath: string, options) => {
      try {
        const fileManager = await getFileManager(fileManagerOpts(options));
        const expiresIn = options.expiresIn ? parseInt(options.expiresIn, 10) : undefined;
        const url = await fileManager.getUrl(filePath, expiresIn);

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'success',
                data: { path: filePath, url, expiresIn: expiresIn || null },
              },
              null,
              2
            )
          );
        } else {
          if (url) {
            console.log(url);
          } else {
            console.log(chalk.yellow('URL generation not supported by current storage backend'));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createFileShowConfigCommand(): Command {
  return new Command('show-config')
    .description('Show file plugin configuration')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const { loadFileConfig } = await import('@fractary/core/common/config');
        const fileConfig = loadFileConfig();

        if (!fileConfig) {
          if (options.json) {
            console.log(
              JSON.stringify(
                {
                  status: 'success',
                  data: {
                    configured: false,
                    message: 'No file configuration found. Using local storage defaults.',
                  },
                },
                null,
                2
              )
            );
          } else {
            console.log(chalk.yellow('No file configuration found.'));
            console.log(chalk.gray('Using local storage defaults (.fractary/files)'));
          }
          return;
        }

        const masked = maskFileConfig(fileConfig);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: masked }, null, 2));
        } else {
          console.log(chalk.bold('File Plugin Configuration:\n'));
          const sources = fileConfig.sources || {};
          const sourceNames = Object.keys(sources);
          if (sourceNames.length === 0) {
            console.log(chalk.yellow('  No sources configured'));
          } else {
            sourceNames.forEach((name: string) => {
              const source = sources[name];
              console.log(`  ${chalk.cyan(name)}: ${source.type}`);
              if (source.bucket) console.log(chalk.gray(`    Bucket: ${source.bucket}`));
              if (source.prefix) console.log(chalk.gray(`    Prefix: ${source.prefix}`));
              if (source.region) console.log(chalk.gray(`    Region: ${source.region}`));
              if (source.local?.basePath)
                console.log(chalk.gray(`    Base path: ${source.local.basePath}`));
              if (source.auth) console.log(chalk.gray(`    Auth: configured`));
            });
          }
          if (fileConfig.globalSettings) {
            console.log(chalk.bold('\nGlobal Settings:'));
            const gs = fileConfig.globalSettings;
            if (gs.retryAttempts)
              console.log(chalk.gray(`  Retry attempts: ${gs.retryAttempts}`));
            if (gs.timeoutSeconds)
              console.log(chalk.gray(`  Timeout: ${gs.timeoutSeconds}s`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createFileTestConnectionCommand(): Command {
  return new Command('test-connection')
    .description('Test storage connection')
    .option('--source <name>', 'Named source to test')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const fileManager = await getFileManager(fileManagerOpts(options));

        const startTime = Date.now();
        await fileManager.list();
        const elapsed = Date.now() - startTime;

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'success',
                data: {
                  source: options.source || 'default',
                  connected: true,
                  responseTimeMs: elapsed,
                },
              },
              null,
              2
            )
          );
        } else {
          console.log(chalk.green(`✓ Connection successful`));
          console.log(chalk.gray(`  Source: ${options.source || 'default (local)'}`));
          console.log(chalk.gray(`  Response time: ${elapsed}ms`));
        }
      } catch (error) {
        if (options.json) {
          console.error(
            JSON.stringify(
              {
                status: 'error',
                error: {
                  code: 'CONNECTION_FAILED',
                  message: error instanceof Error ? error.message : String(error),
                  source: options.source || 'default',
                },
              },
              null,
              2
            )
          );
          process.exit(1);
        }
        handleError(error, options);
      }
    });
}
