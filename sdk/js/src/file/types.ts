/**
 * @fractary/core - File Module Types
 *
 * Type definitions for file storage operations.
 */

/**
 * Generic storage interface for file operations
 */
export interface Storage {
  /**
   * Write content to storage
   * @param id - Unique identifier for the content
   * @param content - Content to write
   * @returns Path or URI where content was written
   */
  write(id: string, content: string): Promise<string>;

  /**
   * Read content from storage
   * @param id - Unique identifier for the content
   * @returns Content or null if not found
   */
  read(id: string): Promise<string | null>;

  /**
   * Check if content exists
   * @param id - Unique identifier for the content
   */
  exists(id: string): Promise<boolean>;

  /**
   * List all items in storage (optionally with prefix)
   * @param prefix - Optional prefix to filter results
   */
  list(prefix?: string): Promise<string[]>;

  /**
   * Delete content from storage
   * @param id - Unique identifier for the content
   */
  delete(id: string): Promise<void>;
}

/**
 * Configuration for file manager
 */
export interface FileManagerConfig {
  /**
   * Base path for file storage
   */
  basePath: string;

  /**
   * Optional storage backend (defaults to LocalStorage)
   */
  storage?: Storage;
}
