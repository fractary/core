/**
 * @fractary/core - File Manager
 *
 * Unified interface for file storage operations.
 */

import { Storage, FileManagerConfig } from './types';
import { LocalStorage } from './local';

/**
 * File Manager - Unified interface for file operations
 */
export class FileManager {
  private storage: Storage;

  constructor(config: FileManagerConfig) {
    this.storage = config.storage || new LocalStorage(config.basePath);
  }

  /**
   * Write file content
   */
  async write(path: string, content: string): Promise<string> {
    return this.storage.write(path, content);
  }

  /**
   * Read file content
   */
  async read(path: string): Promise<string | null> {
    return this.storage.read(path);
  }

  /**
   * Check if file exists
   */
  async exists(path: string): Promise<boolean> {
    return this.storage.exists(path);
  }

  /**
   * List files (optionally with prefix)
   */
  async list(prefix?: string): Promise<string[]> {
    return this.storage.list(prefix);
  }

  /**
   * Delete file
   */
  async delete(path: string): Promise<void> {
    return this.storage.delete(path);
  }

  /**
   * Copy file from one location to another
   */
  async copy(sourcePath: string, destPath: string): Promise<string> {
    const content = await this.read(sourcePath);
    if (!content) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }
    return this.write(destPath, content);
  }

  /**
   * Move file from one location to another
   */
  async move(sourcePath: string, destPath: string): Promise<string> {
    const result = await this.copy(sourcePath, destPath);
    await this.delete(sourcePath);
    return result;
  }
}
