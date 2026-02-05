/**
 * Work subcommand - Work tracking operations
 *
 * Provides issue, comment, label, and milestone operations via @fractary/core WorkManager.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';
import { getWorkManager } from '../../sdk/factory';
import { handleError } from '../../utils/errors';
import { loadConfig, writeConfig, getConfigPath, type CoreConfig } from '../../utils/config';

/**
 * Create the work command tree
 *
 * Commands use dashes to mirror plugin naming:
 * CLI: fractary-core work issue-create
 * Plugin: /fractary-work:issue-create
 */
export function createWorkCommand(): Command {
  const work = new Command('work').description('Work item tracking operations');

  // Issue operations (flat with dashes)
  work.addCommand(createIssueFetchCommand());
  work.addCommand(createIssueCreateCommand());
  work.addCommand(createIssueUpdateCommand());
  work.addCommand(createIssueCloseCommand());
  work.addCommand(createIssueReopenCommand());
  work.addCommand(createIssueAssignCommand());
  work.addCommand(createIssueClassifyCommand());
  work.addCommand(createIssueSearchCommand());

  // Comment operations (flat with dashes, prefixed with issue- to match plugin)
  work.addCommand(createIssueCommentCommand());
  work.addCommand(createIssueCommentListCommand());

  // Label operations (flat with dashes)
  work.addCommand(createLabelAddCommand());
  work.addCommand(createLabelRemoveCommand());
  work.addCommand(createLabelListCommand());

  // Configuration
  work.addCommand(createConfigureCommand());

  return work;
}

// Issue Commands

function createIssueFetchCommand(): Command {
  return new Command('issue-fetch')
    .description('Fetch a work item by ID')
    .argument('<number>', 'Issue number')
    .option('--json', 'Output as JSON')
    .option('--verbose', 'Show additional details')
    .action(async (number: string, options) => {
      try {
        const workManager = await getWorkManager();
        const issue = await workManager.fetchIssue(parseInt(number, 10));

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: issue }, null, 2));
        } else {
          console.log(chalk.bold(`#${issue.number}: ${issue.title}`));
          console.log(chalk.gray(`State: ${issue.state}`));
          if (issue.body) {
            console.log('\n' + issue.body);
          }
          if (options.verbose) {
            if (issue.labels && issue.labels.length > 0) {
              console.log(
                chalk.gray('\nLabels:'),
                issue.labels.map((l: any) => (typeof l === 'string' ? l : l.name)).join(', ')
              );
            }
            if (issue.assignees && issue.assignees.length > 0) {
              console.log(chalk.gray('Assignees:'), issue.assignees.join(', '));
            }
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createIssueCreateCommand(): Command {
  return new Command('issue-create')
    .description('Create a new work item')
    .requiredOption('--title <title>', 'Issue title')
    .option('--body <body>', 'Issue body')
    .option('--labels <labels>', 'Comma-separated labels')
    .option('--assignees <assignees>', 'Comma-separated assignees')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const workManager = await getWorkManager();
        const issue = await workManager.createIssue({
          title: options.title,
          body: options.body,
          labels: options.labels?.split(',').map((l: string) => l.trim()),
          assignees: options.assignees?.split(',').map((a: string) => a.trim()),
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: issue }, null, 2));
        } else {
          console.log(chalk.green(`✓ Created issue #${issue.number}: ${issue.title}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createIssueUpdateCommand(): Command {
  return new Command('issue-update')
    .description('Update a work item')
    .argument('<number>', 'Issue number')
    .option('--title <title>', 'New title')
    .option('--body <body>', 'New body')
    .option('--state <state>', 'New state (open, closed)')
    .option('--json', 'Output as JSON')
    .action(async (number: string, options) => {
      try {
        const workManager = await getWorkManager();
        const issue = await workManager.updateIssue(parseInt(number, 10), {
          title: options.title,
          body: options.body,
          state: options.state,
        });

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: issue }, null, 2));
        } else {
          console.log(chalk.green(`✓ Updated issue #${issue.number}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createIssueCloseCommand(): Command {
  return new Command('issue-close')
    .description('Close a work item')
    .argument('<number>', 'Issue number')
    .option('--comment <text>', 'Add closing comment')
    .option('--json', 'Output as JSON')
    .action(async (number: string, options) => {
      try {
        const workManager = await getWorkManager();

        // Add comment if provided
        if (options.comment) {
          await workManager.createComment(parseInt(number, 10), options.comment);
        }

        const issue = await workManager.closeIssue(parseInt(number, 10));

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: issue }, null, 2));
        } else {
          console.log(chalk.green(`✓ Closed issue #${number}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createIssueReopenCommand(): Command {
  return new Command('issue-reopen')
    .description('Reopen a closed work item')
    .argument('<number>', 'Issue number')
    .option('--comment <text>', 'Add comment when reopening')
    .option('--json', 'Output as JSON')
    .action(async (number: string, options) => {
      try {
        const workManager = await getWorkManager();

        // Add comment if provided
        if (options.comment) {
          await workManager.createComment(parseInt(number, 10), options.comment);
        }

        const issue = await workManager.reopenIssue(parseInt(number, 10));

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'success',
                data: {
                  number: issue.number,
                  state: issue.state,
                  url: issue.url,
                },
              },
              null,
              2
            )
          );
        } else {
          console.log(chalk.green(`✓ Reopened issue #${number}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createIssueAssignCommand(): Command {
  return new Command('issue-assign')
    .description('Assign or unassign a work item')
    .argument('<number>', 'Issue number')
    .option('--user <username>', 'User to assign (use @me for self, omit to unassign)')
    .option('--json', 'Output as JSON')
    .action(async (number: string, options) => {
      try {
        const workManager = await getWorkManager();
        let issue;

        if (options.user) {
          issue = await workManager.assignIssue(parseInt(number, 10), options.user);
        } else {
          issue = await workManager.unassignIssue(parseInt(number, 10));
        }

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'success',
                data: {
                  number: issue.number,
                  assignees: issue.assignees || [],
                  url: issue.url,
                },
              },
              null,
              2
            )
          );
        } else {
          if (options.user) {
            console.log(chalk.green(`✓ Assigned issue #${number} to ${options.user}`));
          } else {
            console.log(chalk.green(`✓ Unassigned issue #${number}`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createIssueSearchCommand(): Command {
  return new Command('issue-search')
    .description('Search work items')
    .requiredOption('--query <query>', 'Search query')
    .option('--state <state>', 'Filter by state (open, closed, all)', 'open')
    .option('--labels <labels>', 'Filter by labels (comma-separated)')
    .option('--limit <n>', 'Max results', '10')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const workManager = await getWorkManager();
        const issues = await workManager.searchIssues(options.query, {
          state: options.state,
          labels: options.labels?.split(',').map((l: string) => l.trim()),
        });

        const limitedIssues = options.limit ? issues.slice(0, parseInt(options.limit, 10)) : issues;

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: limitedIssues }, null, 2));
        } else {
          if (limitedIssues.length === 0) {
            console.log(chalk.yellow('No issues found'));
          } else {
            limitedIssues.forEach((issue: any) => {
              console.log(`#${issue.number} ${issue.title} [${issue.state}]`);
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createIssueClassifyCommand(): Command {
  return new Command('issue-classify')
    .description('Classify work item type (feature, bug, chore, patch)')
    .argument('<number>', 'Issue number')
    .option('--json', 'Output as JSON')
    .action(async (number: string, options) => {
      try {
        const workManager = await getWorkManager();
        const issue = await workManager.fetchIssue(parseInt(number, 10));

        // Use SDK's classification method
        const result = await workManager.classifyWorkType(issue);

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'success',
                data: {
                  number: parseInt(number, 10),
                  work_type: result.work_type,
                  confidence: result.confidence,
                  signals: result.signals,
                },
              },
              null,
              2
            )
          );
        } else {
          console.log(result.work_type);

          if (result.confidence < 0.5) {
            console.log(
              chalk.red(
                `⚠ LOW CONFIDENCE: ${Math.round(result.confidence * 100)}% - review manually`
              )
            );
          } else if (result.confidence < 0.8) {
            console.log(chalk.yellow(`(confidence: ${Math.round(result.confidence * 100)}%)`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

// Comment Commands

function createIssueCommentCommand(): Command {
  return new Command('issue-comment')
    .description('Add a comment to a work item')
    .argument('<number>', 'Issue number')
    .requiredOption('--body <text>', 'Comment body')
    .option('--json', 'Output as JSON')
    .action(async (number: string, options) => {
      try {
        const workManager = await getWorkManager();
        const comment = await workManager.createComment(parseInt(number, 10), options.body);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: comment }, null, 2));
        } else {
          console.log(chalk.green(`✓ Added comment to issue #${number}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createIssueCommentListCommand(): Command {
  return new Command('issue-comment-list')
    .description('List comments on a work item')
    .argument('<number>', 'Issue number')
    .option('--limit <n>', 'Max comments to show')
    .option('--json', 'Output as JSON')
    .action(async (number: string, options) => {
      try {
        const workManager = await getWorkManager();
        const comments = await workManager.listComments(parseInt(number, 10));

        const limitedComments = options.limit
          ? comments.slice(0, parseInt(options.limit, 10))
          : comments;

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: limitedComments }, null, 2));
        } else {
          if (limitedComments.length === 0) {
            console.log(chalk.yellow('No comments'));
          } else {
            limitedComments.forEach((comment: any, idx: number) => {
              console.log(chalk.bold(`\nComment #${idx + 1} by ${comment.author}:`));
              console.log(comment.body);
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

// Label Commands

function createLabelAddCommand(): Command {
  return new Command('label-add')
    .description('Add labels to a work item')
    .argument('<number>', 'Issue number')
    .requiredOption('--labels <labels>', 'Comma-separated labels to add')
    .option('--json', 'Output as JSON')
    .action(async (number: string, options) => {
      try {
        const workManager = await getWorkManager();
        const labels = options.labels.split(',').map((l: string) => l.trim());
        const result = await workManager.addLabels(parseInt(number, 10), labels);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          console.log(chalk.green(`✓ Added labels to issue #${number}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createLabelRemoveCommand(): Command {
  return new Command('label-remove')
    .description('Remove labels from a work item')
    .argument('<number>', 'Issue number')
    .requiredOption('--labels <labels>', 'Comma-separated labels to remove')
    .option('--json', 'Output as JSON')
    .action(async (number: string, options) => {
      try {
        const workManager = await getWorkManager();
        const labels = options.labels.split(',').map((l: string) => l.trim());
        const result = await workManager.removeLabels(parseInt(number, 10), labels);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          console.log(chalk.green(`✓ Removed labels from issue #${number}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createLabelListCommand(): Command {
  return new Command('label-list')
    .description('List all available labels or labels on an issue')
    .option('--issue <number>', 'Show labels for specific issue')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const workManager = await getWorkManager();

        if (options.issue) {
          const issue = await workManager.fetchIssue(parseInt(options.issue, 10));
          const labels = issue.labels || [];

          if (options.json) {
            console.log(JSON.stringify({ status: 'success', data: labels }, null, 2));
          } else {
            if (labels.length === 0) {
              console.log(chalk.yellow('No labels'));
            } else {
              labels.forEach((label: any) => {
                const name = typeof label === 'string' ? label : label.name;
                console.log(`  • ${name}`);
              });
            }
          }
        } else {
          const labels = await workManager.listLabels();

          if (options.json) {
            console.log(JSON.stringify({ status: 'success', data: labels }, null, 2));
          } else {
            if (labels.length === 0) {
              console.log(chalk.yellow('No labels available'));
            } else {
              labels.forEach((label: any) => {
                const name = typeof label === 'string' ? label : label.name;
                console.log(`  • ${name}`);
              });
            }
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

// Configure Command

/**
 * Work config (internal, converted to SDK's YAML format)
 */
interface WorkConfig {
  platform: string;
  owner?: string;
  repo?: string;
  project?: string;
}

function createConfigureCommand(): Command {
  return new Command('configure')
    .description('Configure work tracking settings')
    .option('--platform <name>', 'Platform (github, gitlab, bitbucket, jira, linear)')
    .option('--project <name>', 'Project name (for Jira/Linear)')
    .option('--yes', 'Skip confirmation prompts')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        let platform = options.platform;

        if (!platform) {
          platform = await detectPlatformFromGit();
          if (!options.json) {
            console.log(chalk.gray(`Detected platform: ${platform}`));
          }
        }

        const workConfig = await buildWorkConfig(platform, {
          project: options.project,
        });

        const configPath = await writeWorkConfiguration(workConfig);

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'success',
                data: {
                  platform: workConfig.platform,
                  configPath,
                  owner: workConfig.owner,
                  repo: workConfig.repo,
                  project: workConfig.project,
                },
              },
              null,
              2
            )
          );
        } else {
          console.log(chalk.green(`✓ Work tracking configured`));
          console.log(chalk.gray(`Platform: ${workConfig.platform}`));
          if (workConfig.owner && workConfig.repo) {
            console.log(chalk.gray(`Repository: ${workConfig.owner}/${workConfig.repo}`));
          }
          console.log(chalk.gray(`Config: ${configPath}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

// Helper Functions

/**
 * Detect platform from git remote URL
 */
async function detectPlatformFromGit(): Promise<string> {
  try {
    const gitConfigPath = path.join(process.cwd(), '.git', 'config');
    const gitConfig = await fs.readFile(gitConfigPath, 'utf-8');

    const remoteMatch = gitConfig.match(/\[remote "origin"\][\s\S]*?url\s*=\s*(.+)/);
    if (!remoteMatch) {
      throw new Error('No origin remote found');
    }

    const remoteUrl = remoteMatch[1].trim();

    if (remoteUrl.includes('github.com')) {
      return 'github';
    } else if (remoteUrl.includes('gitlab.com')) {
      return 'gitlab';
    } else if (remoteUrl.includes('bitbucket.org')) {
      return 'bitbucket';
    } else if (remoteUrl.includes('atlassian.net')) {
      return 'jira';
    }

    return 'github';
  } catch {
    return 'github';
  }
}

/**
 * Parse git remote URL to extract owner and repo
 */
function parseGitRemote(url: string): { owner: string; name: string } | null {
  // SSH format: git@github.com:owner/repo.git
  const sshMatch = url.match(/@[^:]+:([^/]+)\/([^.]+)/);
  if (sshMatch) {
    return { owner: sshMatch[1], name: sshMatch[2] };
  }

  // HTTPS format: https://github.com/owner/repo.git
  const httpsMatch = url.match(/https?:\/\/[^/]+\/([^/]+)\/([^/.]+)/);
  if (httpsMatch) {
    return { owner: httpsMatch[1], name: httpsMatch[2] };
  }

  return null;
}

/**
 * Build work configuration (internal format)
 */
async function buildWorkConfig(
  platform: string,
  options: { project?: string }
): Promise<WorkConfig> {
  const config: WorkConfig = {
    platform,
  };

  if (platform === 'github' || platform === 'gitlab' || platform === 'bitbucket') {
    try {
      const gitConfigPath = path.join(process.cwd(), '.git', 'config');
      const gitConfig = await fs.readFile(gitConfigPath, 'utf-8');
      const remoteMatch = gitConfig.match(/\[remote "origin"\][\s\S]*?url\s*=\s*(.+)/);
      if (remoteMatch) {
        const repoInfo = parseGitRemote(remoteMatch[1].trim());
        if (repoInfo) {
          config.owner = repoInfo.owner;
          config.repo = repoInfo.name;
        }
      }
    } catch {
      // Ignore errors, repository info is optional
    }
  } else if (platform === 'jira' || platform === 'linear') {
    if (options.project) {
      config.project = options.project;
    }
  }

  return config;
}

/**
 * Write work configuration to SDK's YAML config file
 *
 * Converts the internal WorkConfig to the SDK's handler-based YAML format
 * and merges it with any existing configuration.
 */
async function writeWorkConfiguration(workConfig: WorkConfig): Promise<string> {
  // Load existing config or create new with explicit error handling
  let existingConfig: CoreConfig;
  try {
    existingConfig = loadConfig() || { version: '2.0' };
  } catch (error) {
    // Log warning but continue with fresh config
    console.warn(
      chalk.yellow('Warning: Could not load existing config, creating new configuration')
    );
    existingConfig = { version: '2.0' };
  }

  // Build handler config for the platform
  const handlerConfig: Record<string, unknown> = {};

  if (workConfig.owner) {
    handlerConfig.owner = workConfig.owner;
  }
  if (workConfig.repo) {
    handlerConfig.repo = workConfig.repo;
  }
  if (workConfig.project) {
    handlerConfig.project = workConfig.project;
  }

  // Use environment variable reference for token (best practice)
  const tokenEnvVar = getTokenEnvVar(workConfig.platform);
  if (tokenEnvVar) {
    handlerConfig.token = `\${${tokenEnvVar}}`;
  }

  // Build the work section in SDK's handler-based format
  const existingHandlers = (existingConfig.work?.handlers || {}) as Record<string, Record<string, unknown>>;
  const existingPlatformConfig = existingHandlers[workConfig.platform] || {};

  const workSection = {
    active_handler: workConfig.platform,
    handlers: {
      ...existingHandlers,
      [workConfig.platform]: {
        ...existingPlatformConfig,
        ...handlerConfig,
      },
    },
  };

  // Merge with existing config
  const mergedConfig: CoreConfig = {
    ...existingConfig,
    work: workSection as CoreConfig['work'],
  };

  // Write using SDK's YAML config writer
  writeConfig(mergedConfig);

  return getConfigPath();
}

/**
 * Get the environment variable name for a platform's token
 */
function getTokenEnvVar(platform: string): string | null {
  switch (platform) {
    case 'github':
      return 'GITHUB_TOKEN';
    case 'gitlab':
      return 'GITLAB_TOKEN';
    case 'bitbucket':
      return 'BITBUCKET_TOKEN';
    case 'jira':
      return 'JIRA_TOKEN';
    case 'linear':
      return 'LINEAR_API_KEY';
    default:
      return null;
  }
}
