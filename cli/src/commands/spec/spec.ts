/**
 * Spec operations for specification management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { execFileSync } from 'child_process';
import { getSpecManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

export function createSpecCreateFileCommand(): Command {
  return new Command('spec-create-file')
    .description('Create a new specification file')
    .argument('<title>', 'Specification title')
    .option('--template <type>', 'Specification template (feature, bugfix, refactor)', 'feature')
    .option('--work-id <id>', 'Associated work item ID')
    .option('--json', 'Output as JSON')
    .action(async (title: string, options) => {
      try {
        const specManager = await getSpecManager();
        const spec = specManager.createSpec(title, {
          template: options.template,
          workId: options.workId,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: spec }, null, 2));
        } else {
          console.log(chalk.green(`✓ Created specification: ${spec.title}`));
          console.log(chalk.gray(`  ID: ${spec.id}`));
          console.log(chalk.gray(`  Path: ${spec.path}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createSpecGetCommand(): Command {
  return new Command('spec-get')
    .description('Get a specification by ID or path')
    .argument('<id>', 'Specification ID or path')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const specManager = await getSpecManager();
        const spec = specManager.getSpec(id);

        if (!spec) {
          if (options.json) {
            console.error(
              JSON.stringify(
                {
                  status: 'error',
                  error: { code: 'SPEC_NOT_FOUND', message: `Specification not found: ${id}` },
                },
                null,
                2
              )
            );
          } else {
            console.error(chalk.red(`Specification not found: ${id}`));
          }
          process.exit(3);
        }

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: spec }, null, 2));
        } else {
          console.log(chalk.bold(`${spec.title}`));
          console.log(chalk.gray(`ID: ${spec.id}`));
          console.log(chalk.gray(`Status: ${spec.metadata.validation_status || 'not_validated'}`));
          console.log(chalk.gray(`Work ID: ${spec.workId || 'N/A'}`));
          console.log('\n' + spec.content);
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createSpecListCommand(): Command {
  return new Command('spec-list')
    .description('List specifications')
    .option('--status <status>', 'Filter by status (draft, validated, needs_revision)')
    .option('--work-id <id>', 'Filter by work item ID')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const specManager = await getSpecManager();
        const specs = specManager.listSpecs({
          status: options.status,
          workId: options.workId,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: specs }, null, 2));
        } else {
          if (specs.length === 0) {
            console.log(chalk.yellow('No specifications found'));
          } else {
            specs.forEach((spec: any) => {
              const status = spec.metadata.validation_status || 'draft';
              console.log(`${spec.id}: ${spec.title} [${status}]`);
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createSpecUpdateCommand(): Command {
  return new Command('spec-update')
    .description('Update a specification')
    .argument('<id>', 'Specification ID or path')
    .option('--title <title>', 'New title')
    .option('--content <content>', 'New content')
    .option('--work-id <id>', 'Update work item ID')
    .option('--status <status>', 'Update status')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const specManager = await getSpecManager();
        const spec = specManager.updateSpec(id, {
          title: options.title,
          content: options.content,
          workId: options.workId,
          validationStatus: options.status,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: spec }, null, 2));
        } else {
          console.log(chalk.green(`✓ Updated specification: ${spec.id}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createSpecDeleteCommand(): Command {
  return new Command('spec-delete')
    .description('Delete a specification')
    .argument('<id>', 'Specification ID or path')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const specManager = await getSpecManager();
        specManager.deleteSpec(id);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: { id } }, null, 2));
        } else {
          console.log(chalk.green(`✓ Deleted specification: ${id}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createSpecValidateCheckCommand(): Command {
  return new Command('spec-validate-check')
    .description('Run structural validation checks on a specification')
    .argument('<id>', 'Specification ID or path')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const specManager = await getSpecManager();
        const result = specManager.validateSpec(id);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          console.log(chalk.bold(`Validation Result: ${result.status.toUpperCase()}`));
          console.log(chalk.gray(`Score: ${result.score}%`));

          if (result.checks.requirements) {
            const req = result.checks.requirements;
            console.log(chalk.gray(`\nRequirements: ${req.completed}/${req.total} - ${req.status}`));
          }
          if (result.checks.acceptanceCriteria) {
            const ac = result.checks.acceptanceCriteria;
            console.log(chalk.gray(`Acceptance Criteria: ${ac.met}/${ac.total} - ${ac.status}`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createSpecRefineScanCommand(): Command {
  return new Command('spec-refine-scan')
    .description('Scan a specification for structural gaps and refinement areas')
    .argument('<id>', 'Specification ID or path')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const specManager = await getSpecManager();
        const questions = specManager.generateRefinementQuestions(id);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: questions }, null, 2));
        } else {
          if (questions.length === 0) {
            console.log(chalk.green('No refinement questions needed'));
          } else {
            console.log(chalk.bold('Refinement Questions:'));
            questions.forEach((question: any, idx: number) => {
              console.log(`\n${idx + 1}. ${chalk.yellow(question.question)}`);
              console.log(chalk.gray(`   Category: ${question.category}`));
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function computeFileChecksum(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function createSpecArchiveCommand(): Command {
  return new Command('spec-archive')
    .description('Archive specifications for a completed issue (copy to archive, verify, remove originals)')
    .argument('<issue_number>', 'GitHub issue number')
    .option('--local', 'Force local archive mode (skip cloud storage)')
    .option('--json', 'Output as JSON')
    .action(async (issueNumber: string, options) => {
      try {
        const specManager = await getSpecManager();

        // Find specs matching this issue by filename pattern
        const allSpecs = specManager.listSpecs();
        const paddedIssue = issueNumber.padStart(5, '0');
        const matchingSpecs = allSpecs.filter((spec: any) => {
          const filename = path.basename(spec.path);
          return filename.startsWith(`SPEC-${paddedIssue}`) ||
                 filename.startsWith(`WORK-${paddedIssue}`);
        });

        if (matchingSpecs.length === 0) {
          if (options.json) {
            console.error(
              JSON.stringify(
                {
                  status: 'error',
                  error: { code: 'NO_SPECS_FOUND', message: `No specifications found for issue ${issueNumber}` },
                },
                null,
                2
              )
            );
          } else {
            console.error(chalk.red(`No specifications found for issue ${issueNumber}`));
          }
          process.exit(3);
        }

        // Determine archive mode
        let archiveMode: 'local' | 'cloud' = 'local';

        if (!options.local) {
          try {
            const { loadFileConfig } = await import('@fractary/core/common/config');
            const fileConfig = loadFileConfig();
            const specsSource = fileConfig?.sources?.specs;
            if (
              specsSource &&
              ['s3', 'r2', 'gcs'].includes(specsSource.type) &&
              specsSource.bucket
            ) {
              const storageScript = path.resolve(
                'plugins/file/skills/file-manager/scripts/storage.mjs'
              );
              if (fs.existsSync(storageScript)) {
                archiveMode = 'cloud';
              }
            }
          } catch {
            // Config not available, use local mode
          }
        }

        if (!options.json) {
          console.log(
            chalk.gray(
              `Archiving ${matchingSpecs.length} spec(s) for issue ${issueNumber} (${archiveMode} mode)`
            )
          );
        }

        const results: any[] = [];
        const errors: Array<{ filename: string; error: string }> = [];

        for (const spec of matchingSpecs) {
          const filename = path.basename(spec.path);
          const specPath = spec.path;

          try {
            if (archiveMode === 'cloud') {
              // Cloud archive: use upload-to-cloud.sh (calls SDK storage)
              const cloudPath = `archive/specs/${filename}`;
              const scriptPath = path.resolve(
                'plugins/spec/scripts/upload-to-cloud.sh'
              );

              const result = execFileSync(scriptPath, [specPath, cloudPath], {
                encoding: 'utf-8',
                timeout: 60000,
              });

              const parsed = JSON.parse(result.trim());
              results.push(parsed);
            } else {
              // Local archive: copy, verify checksum, delete original
              const specsDir = path.dirname(specPath);
              const archiveDir = path.join(specsDir, 'archive');
              const archivePath = path.join(archiveDir, filename);

              const checksum = computeFileChecksum(specPath);
              const fileSize = fs.statSync(specPath).size;

              fs.mkdirSync(archiveDir, { recursive: true });
              fs.copyFileSync(specPath, archivePath);

              const archiveChecksum = computeFileChecksum(archivePath);
              if (checksum !== archiveChecksum) {
                fs.unlinkSync(archivePath);
                throw new Error(
                  'Checksum mismatch after copy - archive removed, original preserved'
                );
              }

              // Checksum verified - safe to remove original
              fs.unlinkSync(specPath);

              results.push({
                filename,
                source_path: specPath,
                archive_path: archivePath,
                size_bytes: fileSize,
                checksum: `sha256:${checksum}`,
                archived_at: new Date().toISOString(),
                archive_mode: 'local',
              });
            }

            if (!options.json) {
              console.log(chalk.green(`  ✓ ${filename}`));
            }
          } catch (err: any) {
            errors.push({ filename, error: err.message || String(err) });
            if (!options.json) {
              console.error(chalk.red(`  ✗ ${filename}: ${err.message || err}`));
            }
          }
        }

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status:
                  errors.length === 0
                    ? 'success'
                    : results.length > 0
                      ? 'partial'
                      : 'error',
                data: {
                  archived: results,
                  errors: errors.length > 0 ? errors : undefined,
                  summary: {
                    total: matchingSpecs.length,
                    archived: results.length,
                    failed: errors.length,
                    archive_mode: archiveMode,
                  },
                },
              },
              null,
              2
            )
          );
        } else {
          console.log('');
          console.log(
            `${chalk.green(String(results.length))} archived, ` +
              `${errors.length > 0 ? chalk.red(String(errors.length)) : '0'} failed`
          );
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
