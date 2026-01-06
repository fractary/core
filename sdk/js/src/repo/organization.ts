import { execFileNoThrow } from '../common/exec-file-no-throw.js';

/**
 * Represents a git remote with parsed organization and project information
 */
export interface GitRemote {
  name: string;
  url: string;
  organization?: string;
  project?: string;
}

/**
 * Parse a git remote URL to extract organization and project name
 *
 * Supports:
 * - SSH format: git@github.com:org/project.git
 * - HTTPS format: https://github.com/org/project.git
 * - GitLab subgroups: git@gitlab.com:org/subgroup/project.git
 *
 * @param remoteUrl - The git remote URL to parse
 * @returns Parsed remote information or null if parsing fails
 */
export function parseGitRemote(remoteUrl: string): GitRemote | null {
  if (!remoteUrl || typeof remoteUrl !== 'string') {
    return null;
  }

  const trimmedUrl = remoteUrl.trim();

  // SSH format: git@github.com:org/project.git or git@github.com:org/subgroup/project.git
  const sshMatch = trimmedUrl.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
  if (sshMatch) {
    const host = sshMatch[1];
    const pathParts = sshMatch[2].split('/');

    // For GitLab-style subgroups, join org and subgroups with hyphen
    if (pathParts.length > 2) {
      const organization = pathParts.slice(0, -1).join('-');
      const project = pathParts[pathParts.length - 1].replace(/\.git$/, '');
      return {
        name: 'origin',
        url: trimmedUrl,
        organization,
        project
      };
    }

    // Standard org/project format
    if (pathParts.length === 2) {
      return {
        name: 'origin',
        url: trimmedUrl,
        organization: pathParts[0],
        project: pathParts[1].replace(/\.git$/, '')
      };
    }
  }

  // HTTPS format: https://github.com/org/project.git or https://github.com/org/subgroup/project.git
  const httpsMatch = trimmedUrl.match(/^https?:\/\/([^/]+)\/(.+?)(?:\.git)?$/);
  if (httpsMatch) {
    const host = httpsMatch[1];
    const pathParts = httpsMatch[2].split('/');

    // For GitLab-style subgroups, join org and subgroups with hyphen
    if (pathParts.length > 2) {
      const organization = pathParts.slice(0, -1).join('-');
      const project = pathParts[pathParts.length - 1].replace(/\.git$/, '');
      return {
        name: 'origin',
        url: trimmedUrl,
        organization,
        project
      };
    }

    // Standard org/project format
    if (pathParts.length === 2) {
      return {
        name: 'origin',
        url: trimmedUrl,
        organization: pathParts[0],
        project: pathParts[1].replace(/\.git$/, '')
      };
    }
  }

  return null;
}

/**
 * Extract organization name from a git remote URL
 *
 * @param remoteUrl - The git remote URL to parse
 * @returns Organization name or 'local' if extraction fails
 */
export function extractOrganization(remoteUrl: string): string {
  const parsed = parseGitRemote(remoteUrl);
  return parsed?.organization || 'local';
}

/**
 * Extract project name from a git remote URL
 *
 * @param remoteUrl - The git remote URL to parse
 * @returns Project name or null if extraction fails
 */
export function extractProjectName(remoteUrl: string): string | null {
  const parsed = parseGitRemote(remoteUrl);
  return parsed?.project || null;
}

/**
 * Get git remote information for a repository
 *
 * Fetches the URL of the 'origin' remote and parses it to extract
 * organization and project information.
 *
 * @param cwd - The working directory of the git repository
 * @returns Parsed remote information or null if remote doesn't exist or parsing fails
 */
export async function getRemoteInfo(cwd: string): Promise<GitRemote | null> {
  try {
    const result = await execFileNoThrow('git', ['remote', 'get-url', 'origin'], { cwd });

    if (result.exitCode !== 0) {
      return null;
    }

    const url = result.stdout.trim();
    return parseGitRemote(url);
  } catch (error) {
    // Git command failed or remote doesn't exist
    return null;
  }
}
