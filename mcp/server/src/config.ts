import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Configuration interface for the MCP server
 */
export interface Config {
  work?: {
    platform: 'github' | 'jira' | 'linear';
    owner?: string;
    repo?: string;
    token?: string;
    project?: string;
  };
  repo?: {
    platform: 'github' | 'gitlab' | 'bitbucket';
    owner?: string;
    repo?: string;
    token?: string;
    defaultBranch?: string;
  };
  spec?: {
    localPath?: string;
  };
  logs?: {
    localPath?: string;
  };
  file?: {
    basePath?: string;
  };
  docs?: {
    docsDir?: string;
  };
}

/**
 * Load configuration from environment variables and config files
 * Priority:
 * 1. Environment variables
 * 2. Project config: {cwd}/.fractary/config.json
 * 3. User config: ~/.fractary/config.json
 */
export async function loadConfig(): Promise<Config> {
  const config: Config = {};

  // 1. Load from environment variables
  // Priority order: GITHUB > JIRA > LINEAR for work, GITHUB > GITLAB > BITBUCKET for repo
  // Only set if not already configured (respects priority)

  // Work configuration (GitHub takes priority)
  if (process.env.GITHUB_TOKEN && !config.work) {
    config.work = {
      platform: 'github',
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      token: process.env.GITHUB_TOKEN,
    };
  }

  if (process.env.JIRA_TOKEN && !config.work) {
    config.work = {
      platform: 'jira',
      token: process.env.JIRA_TOKEN,
      project: process.env.JIRA_PROJECT,
    };
  }

  if (process.env.LINEAR_API_KEY && !config.work) {
    config.work = {
      platform: 'linear',
      token: process.env.LINEAR_API_KEY,
    };
  }

  // Repo configuration (GitHub takes priority)
  if (process.env.GITHUB_TOKEN && !config.repo) {
    config.repo = {
      platform: 'github',
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      token: process.env.GITHUB_TOKEN,
    };
  }

  if (process.env.GITLAB_TOKEN && !config.repo) {
    config.repo = {
      platform: 'gitlab',
      owner: process.env.GITLAB_OWNER,
      repo: process.env.GITLAB_REPO,
      token: process.env.GITLAB_TOKEN,
    };
  }

  if (process.env.BITBUCKET_TOKEN && !config.repo) {
    config.repo = {
      platform: 'bitbucket',
      owner: process.env.BITBUCKET_OWNER,
      repo: process.env.BITBUCKET_REPO,
      token: process.env.BITBUCKET_TOKEN,
    };
  }

  // 2. Load from config files (project first, then user)
  const configPaths = [
    join(process.cwd(), '.fractary', 'config.json'),
    join(homedir(), '.fractary', 'config.json'),
  ];

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const fileContent = readFileSync(configPath, 'utf-8');
        const fileConfig = JSON.parse(fileContent) as Config;

        // Merge file config with existing config (env vars take precedence)
        if (fileConfig.work && !config.work) {
          config.work = fileConfig.work;
        }
        if (fileConfig.repo && !config.repo) {
          config.repo = fileConfig.repo;
        }
        if (fileConfig.spec) {
          config.spec = { ...fileConfig.spec, ...config.spec };
        }
        if (fileConfig.logs) {
          config.logs = { ...fileConfig.logs, ...config.logs };
        }
        if (fileConfig.file) {
          config.file = { ...fileConfig.file, ...config.file };
        }
        if (fileConfig.docs) {
          config.docs = { ...fileConfig.docs, ...config.docs };
        }

        // Use first config file found
        break;
      } catch (error) {
        // Sanitize error message to prevent token exposure
        const sanitizedError = error instanceof Error
          ? error.message.replace(/(token|key|password|secret)["']?\s*:\s*["']?[^"',}\s]+/gi, '$1: [REDACTED]')
          : 'Unknown error';
        console.error(`Failed to load config from ${configPath}:`, sanitizedError);
      }
    }
  }

  return config;
}
