/**
 * Error Handling Utilities
 *
 * Provides centralized error handling for the CLI with proper exit codes
 * and formatted error messages for both JSON and text output modes.
 */

import chalk from 'chalk';
import { SDKNotAvailableError } from '../sdk/factory';

/**
 * Output options for error handling
 */
export interface OutputOptions {
  json?: boolean;
}

/**
 * Custom CLI error class
 */
export class CLIError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'CLIError';
  }
}

/**
 * Exit codes for different error types
 */
export const ExitCodes = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_ARGUMENT: 2,
  NOT_FOUND: 3,
  PERMISSION_DENIED: 4,
  CONFLICT: 5,
  SDK_NOT_AVAILABLE: 9,
} as const;

/**
 * Handle errors and exit with appropriate code
 *
 * @param error - The error to handle
 * @param options - Output options (JSON mode, etc.)
 */
export function handleError(error: unknown, options: OutputOptions = {}): never {
  if (error instanceof SDKNotAvailableError) {
    if (options.json) {
      console.error(
        JSON.stringify(
          {
            status: 'error',
            error: {
              code: 'SDK_NOT_AVAILABLE',
              message: error.message,
              sdk: error.sdk,
            },
          },
          null,
          2
        )
      );
    } else {
      console.error(chalk.red('Error:'), error.message);
      console.error(
        chalk.gray('\nMake sure @fractary/core is installed:'),
        chalk.cyan('npm install @fractary/core')
      );
    }
    process.exit(ExitCodes.SDK_NOT_AVAILABLE);
  }

  if (error instanceof CLIError) {
    if (options.json) {
      console.error(
        JSON.stringify(
          {
            status: 'error',
            error: {
              code: error.code,
              message: error.message,
            },
          },
          null,
          2
        )
      );
    } else {
      console.error(chalk.red('Error:'), error.message);
    }

    // Map error codes to exit codes
    const exitCode = getExitCodeForError(error.code);
    process.exit(exitCode);
  }

  // Handle generic errors
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (options.json) {
    console.error(
      JSON.stringify(
        {
          status: 'error',
          error: {
            code: 'UNKNOWN_ERROR',
            message: errorMessage,
          },
        },
        null,
        2
      )
    );
  } else {
    console.error(chalk.red('Error:'), errorMessage);

    // Include stack trace in non-JSON mode for debugging
    if (error instanceof Error && error.stack) {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.gray(error.stack));
    }
  }

  process.exit(ExitCodes.GENERAL_ERROR);
}

/**
 * Get exit code for a CLI error code
 */
function getExitCodeForError(code: string): number {
  switch (code) {
    case 'INVALID_ARGUMENT':
    case 'INVALID_INPUT':
    case 'VALIDATION_ERROR':
      return ExitCodes.INVALID_ARGUMENT;

    case 'NOT_FOUND':
    case 'ISSUE_NOT_FOUND':
    case 'SPEC_NOT_FOUND':
    case 'LOG_NOT_FOUND':
      return ExitCodes.NOT_FOUND;

    case 'PERMISSION_DENIED':
    case 'UNAUTHORIZED':
      return ExitCodes.PERMISSION_DENIED;

    case 'CONFLICT':
    case 'ALREADY_EXISTS':
      return ExitCodes.CONFLICT;

    default:
      return ExitCodes.GENERAL_ERROR;
  }
}

/**
 * Wrap a function with error handling
 *
 * @param fn - The async function to wrap
 * @param options - Output options
 * @returns Wrapped function that handles errors
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: OutputOptions = {}
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, options);
    }
  };
}
