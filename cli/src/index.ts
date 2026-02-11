/**
 * Fractary Core CLI - Library Entry Point
 *
 * Exports for programmatic use of CLI components
 */

// Re-export SDK factory for programmatic use
export {
  getWorkManager,
  getRepoManager,
  getLogManager,
  getFileManager,
  getDocsManager,
  SDKNotAvailableError,
  clearInstances,
  isCoreAvailable,
} from './sdk/factory';

// Re-export command creators for programmatic composition
export { createWorkCommand } from './commands/work';
export { createRepoCommand } from './commands/repo';
export { createLogsCommand } from './commands/logs';
export { createFileCommand } from './commands/file';
export { createDocsCommand } from './commands/docs';

// Re-export utilities
export * from './utils/output';
export * from './utils/config';
export * from './utils/errors';
