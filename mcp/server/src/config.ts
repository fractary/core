import { access } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { constants } from 'fs';
import { sanitizeSecrets } from './handlers/security.js';
import { loadYamlConfig, findProjectRoot } from '@fractary/core/common/yaml-config';

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
    sources?: Record<string, {
      type: 'local' | 's3' | 'r2' | 'gcs' | 'gdrive';
      bucket?: string;
      prefix?: string;
      region?: string;
      projectId?: string;
      accountId?: string;
      folderId?: string;
      local?: { basePath: string };
      auth?: {
        profile?: string;
        accessKeyId?: string;
        secretAccessKey?: string;
        keyFilePath?: string;
      };
      publicUrl?: string;
    }>;
  };
  docs?: {
    docsDir?: string;
  };
}

/**
 * Load configuration from environment variables and config files
 * Priority:
 * 1. Environment variables
 * 2. Project config: {cwd}/.fractary/core/config.yaml
 * 3. User config: ~/.fractary/core/config.yaml
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

  // 2. Load from YAML config files (project first, then user)
  const projectRoot = findProjectRoot(process.cwd());
  const configPaths = [
    join(projectRoot, '.fractary', 'core', 'config.yaml'),
    join(homedir(), '.fractary', 'core', 'config.yaml'),
  ];

  for (const configPath of configPaths) {
    try {
      // Check if file exists
      await access(configPath, constants.F_OK);

      // Load YAML config using unified loader
      const fileConfig = loadYamlConfig({
        projectRoot: configPath.includes(homedir()) ? homedir() : projectRoot,
        warnMissingEnvVars: false, // Don't warn in MCP server context
      });

      if (!fileConfig) {
        continue;
      }

      // Merge file config with existing config (env vars take precedence)
      // Convert SDK's handler-based config to MCP's flat config format
      if (fileConfig.work && !config.work) {
        const activeHandler = fileConfig.work.active_handler as 'github' | 'jira' | 'linear';
        const handlerConfig = fileConfig.work.handlers?.[activeHandler] || {};
        config.work = {
          platform: activeHandler,
          owner: handlerConfig.owner,
          repo: handlerConfig.repo,
          token: handlerConfig.token,
          project: handlerConfig.project,
        };
      }
      if (fileConfig.repo && !config.repo) {
        const activeHandler = fileConfig.repo.active_handler as 'github' | 'gitlab' | 'bitbucket';
        const handlerConfig = fileConfig.repo.handlers?.[activeHandler] || {};
        config.repo = {
          platform: activeHandler,
          owner: handlerConfig.owner,
          repo: handlerConfig.repo,
          token: handlerConfig.token,
          defaultBranch: fileConfig.repo.defaults?.default_branch,
        };
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
      // File doesn't exist or read error - skip to next path
      if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
        // Sanitize error message to prevent token/secret exposure (only for non-ENOENT errors)
        // Uses comprehensive secret detection to catch tokens, API keys, bearer auth, etc.
        const sanitizedError = sanitizeSecrets(error.message);
        const sanitizedPath = sanitizeSecrets(configPath);
        console.error(`Failed to load config from ${sanitizedPath}:`, sanitizedError);
      }
    }
  }

  return config;
}
