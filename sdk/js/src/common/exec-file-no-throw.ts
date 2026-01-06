/**
 * Exec File No Throw - Safe command execution wrapper
 *
 * Provides a secure way to execute commands without throwing exceptions.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * Options for command execution
 */
export interface ExecOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeout?: number;
}

/**
 * Result from command execution
 */
export interface ExecResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Execute a command safely without throwing exceptions
 *
 * This function wraps Node's execFile and returns a result object
 * instead of throwing on non-zero exit codes.
 *
 * @param command Command to execute (e.g., 'git')
 * @param args Arguments array (e.g., ['status', '--short'])
 * @param options Execution options (cwd, env, timeout)
 * @returns Promise with exitCode, stdout, and stderr
 *
 * @example
 * ```typescript
 * const result = await execFileNoThrow('git', ['status'], { cwd: '/repo' });
 * if (result.exitCode === 0) {
 *   console.log(result.stdout);
 * }
 * ```
 */
export async function execFileNoThrow(
  command: string,
  args: string[],
  options?: ExecOptions
): Promise<ExecResult> {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd: options?.cwd,
      env: options?.env,
      timeout: options?.timeout,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    return {
      exitCode: 0,
      stdout: stdout || '',
      stderr: stderr || '',
    };
  } catch (error: any) {
    // Command failed or timed out
    return {
      exitCode: error.code || 1,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
    };
  }
}
