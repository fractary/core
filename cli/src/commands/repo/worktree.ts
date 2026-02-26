/**
 * Worktree operations for repository management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { getRepoManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

function copyEnvFiles(cwd: string, worktreePath: string): void {
  // Copy .fractary/env/.env* files (standard location)
  const fractaryEnvDir = path.join(cwd, '.fractary', 'env');
  if (fs.existsSync(fractaryEnvDir) && fs.statSync(fractaryEnvDir).isDirectory()) {
    const destEnvDir = path.join(worktreePath, '.fractary', 'env');
    try {
      fs.mkdirSync(destEnvDir, { recursive: true });
    } catch (e) {
      console.error(`Warning: failed to create ${destEnvDir}`);
    }
    for (const file of fs.readdirSync(fractaryEnvDir)) {
      if (!file.startsWith('.env') || file === '.env.example') continue;
      const src = path.join(fractaryEnvDir, file);
      if (!fs.statSync(src).isFile()) continue;
      try {
        fs.copyFileSync(src, path.join(destEnvDir, file));
      } catch (e) {
        console.error(`Warning: failed to copy ${file} to worktree`);
      }
    }
  }

  // Copy root .env* files (legacy location)
  for (const file of fs.readdirSync(cwd)) {
    if (!file.startsWith('.env') || file === '.env.example') continue;
    const src = path.join(cwd, file);
    try {
      if (!fs.statSync(src).isFile()) continue;
      fs.copyFileSync(src, path.join(worktreePath, file));
    } catch {
      // Silently skip legacy root .env files that fail
    }
  }
}

export function createWorktreeCreateCommand(): Command {
  return new Command('worktree-create')
    .description('Create a new worktree')
    .argument('<branch>', 'Branch name')
    .option('--path <path>', 'Worktree path')
    .option('--work-id <id>', 'Work item ID')
    .option('--base <branch>', 'Base branch to create from')
    .option('--no-checkout', 'Skip checking out files')
    .option('--json', 'Output as JSON')
    .action(async (branch: string, options) => {
      try {
        const repoManager = await getRepoManager();

        const worktree = repoManager.createWorktree({
          branch,
          path: options.path || `.worktrees/${branch}`,
          workId: options.workId,
          baseBranch: options.base,
        });

        copyEnvFiles(process.cwd(), worktree.path);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: worktree }, null, 2));
        } else {
          console.log(chalk.green(`✓ Created worktree for branch: ${branch}`));
          console.log(chalk.gray(`Path: ${worktree.path}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createWorktreeListCommand(): Command {
  return new Command('worktree-list')
    .description('List worktrees')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const repoManager = await getRepoManager();
        const worktrees = await repoManager.listWorktrees();

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: worktrees }, null, 2));
        } else {
          if (worktrees.length === 0) {
            console.log(chalk.yellow('No worktrees'));
          } else {
            worktrees.forEach((wt: any) => {
              const isCurrent = wt.current ? chalk.green('* ') : '  ';
              console.log(`${isCurrent}${wt.path} [${wt.branch}]`);
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createWorktreeRemoveCommand(): Command {
  return new Command('worktree-remove')
    .description('Remove a worktree')
    .argument('<path>', 'Worktree path')
    .option('--force', 'Force removal even with uncommitted changes')
    .option('--json', 'Output as JSON')
    .action(async (path: string, options) => {
      try {
        const repoManager = await getRepoManager();

        repoManager.removeWorktree(path, options.force);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: { path } }, null, 2));
        } else {
          console.log(chalk.green(`✓ Removed worktree: ${path}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createWorktreeCleanupCommand(): Command {
  return new Command('worktree-cleanup')
    .description('Clean up stale worktrees')
    .option('--merged', 'Remove only merged worktrees')
    .option('--stale', 'Remove only stale worktrees')
    .option('--dry-run', 'Show what would be removed without removing')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const repoManager = await getRepoManager();

        const result = await repoManager.cleanupWorktrees({
          merged: options.merged,
          stale: options.stale,
          dryRun: options.dryRun,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          if (options.dryRun) {
            console.log(chalk.yellow(`Would remove ${result.removed?.length || 0} worktrees`));
            if (result.removed && result.removed.length > 0) {
              result.removed.forEach((path: string) => {
                console.log(chalk.gray(`  - ${path}`));
              });
            }
          } else {
            console.log(chalk.green(`✓ Cleaned up ${result.removed?.length || 0} worktrees`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
