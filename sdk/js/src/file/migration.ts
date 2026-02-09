/**
 * @fractary/core - Archive Migration
 *
 * Migrates locally archived files to cloud storage when a project transitions
 * from local to cloud-based archiving.
 *
 * When a project starts out, archives go to a local folder (e.g., .fractary/logs/archive/).
 * When cloud storage is configured, this module finds all previously locally archived files
 * and uploads them to cloud storage, then removes the local copies.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Storage } from './types';
import { LocalStorage } from './local';

/**
 * Options for migrating local archives to cloud storage
 */
export interface MigrateArchiveOptions {
  /** Local archive directory to scan (e.g., '.fractary/logs/archive') */
  localArchiveDir: string;

  /** Cloud storage prefix for archived files (e.g., 'archive/logs') */
  cloudPrefix: string;

  /** Cloud storage backend to upload to */
  cloudStorage: Storage;

  /** If true, report what would be migrated without actually doing it */
  dryRun?: boolean;

  /** If true, verify file exists in cloud before removing local copy (default: true) */
  verify?: boolean;
}

/**
 * Result of a single file migration
 */
export interface MigratedFile {
  /** Relative path within the local archive */
  file: string;

  /** Cloud URL or path after upload */
  cloudUrl: string;
}

/**
 * Result of a failed file migration
 */
export interface FailedFile {
  /** Path of the file that failed */
  file: string;

  /** Error message */
  error: string;
}

/**
 * Result of an archive migration operation
 */
export interface MigrateArchiveResult {
  /** Number of files successfully migrated */
  migrated: number;

  /** Number of files that failed to migrate */
  failed: number;

  /** ISO timestamp of when migration ran */
  migratedAt: string;

  /** Details of successfully migrated files */
  migratedFiles: MigratedFile[];

  /** Details of failed files */
  failedFiles: FailedFile[];

  /** Whether this was a dry run */
  dryRun: boolean;

  /** Message summarizing the result */
  message: string;
}

/**
 * Recursively find all files in a directory
 */
function findAllFiles(dir: string): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findAllFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Remove empty directories recursively (bottom-up)
 */
function removeEmptyDirs(dir: string): void {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      removeEmptyDirs(path.join(dir, entry.name));
    }
  }

  // Re-read after cleaning subdirectories
  const remaining = fs.readdirSync(dir);
  if (remaining.length === 0) {
    fs.rmdirSync(dir);
  }
}

/**
 * Migrate locally archived files to cloud storage.
 *
 * Scans the local archive directory, uploads each file to the cloud storage
 * backend using the same relative path structure, verifies the upload,
 * and removes the local copy.
 *
 * This operation is idempotent - if no local archived files exist, it
 * returns immediately with migrated: 0.
 *
 * @example
 * ```typescript
 * import { migrateArchive } from '@fractary/core/file';
 * import { createStorageFromSource } from '@fractary/core/file';
 * import { loadFileConfig } from '@fractary/core/common/config';
 *
 * const fileConfig = loadFileConfig();
 * const cloudStorage = createStorageFromSource('logs', fileConfig);
 *
 * const result = await migrateArchive({
 *   localArchiveDir: '.fractary/logs/archive',
 *   cloudPrefix: 'archive/logs',
 *   cloudStorage,
 * });
 *
 * console.log(`Migrated ${result.migrated} files`);
 * ```
 */
export async function migrateArchive(
  options: MigrateArchiveOptions
): Promise<MigrateArchiveResult> {
  const { localArchiveDir, cloudPrefix, cloudStorage, dryRun = false, verify = true } = options;

  // Check if local archive directory exists
  if (!fs.existsSync(localArchiveDir)) {
    return {
      migrated: 0,
      failed: 0,
      migratedAt: new Date().toISOString(),
      migratedFiles: [],
      failedFiles: [],
      dryRun,
      message: 'No local archive directory found',
    };
  }

  // Find all files in the local archive
  const localFiles = findAllFiles(localArchiveDir);
  if (localFiles.length === 0) {
    return {
      migrated: 0,
      failed: 0,
      migratedAt: new Date().toISOString(),
      migratedFiles: [],
      failedFiles: [],
      dryRun,
      message: 'No locally archived files to migrate',
    };
  }

  const migratedFiles: MigratedFile[] = [];
  const failedFiles: FailedFile[] = [];

  for (const filePath of localFiles) {
    // Compute relative path from local archive root
    const relPath = path.relative(localArchiveDir, filePath);

    // Cloud path mirrors the same structure under the cloud prefix
    const cloudPath = path.posix.join(cloudPrefix, relPath.split(path.sep).join('/'));

    if (dryRun) {
      migratedFiles.push({ file: relPath, cloudUrl: cloudPath });
      continue;
    }

    try {
      // Read the local file
      const content = fs.readFileSync(filePath, 'utf-8');

      // Upload to cloud storage
      const cloudUrl = await cloudStorage.write(cloudPath, content);

      // Verify the upload if requested
      if (verify) {
        const exists = await cloudStorage.exists(cloudPath);
        if (!exists) {
          failedFiles.push({
            file: relPath,
            error: 'File not found in cloud after upload',
          });
          continue;
        }
      }

      // Remove local copy after successful upload and verification
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Non-fatal - file is safely in cloud
      }

      migratedFiles.push({ file: relPath, cloudUrl });
    } catch (error) {
      failedFiles.push({
        file: relPath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Clean up empty directories
  if (!dryRun) {
    try {
      removeEmptyDirs(localArchiveDir);
    } catch {
      // Non-fatal
    }
  }

  const migrated = migratedFiles.length;
  const failed = failedFiles.length;

  let message: string;
  if (dryRun) {
    message = `Dry run: ${migrated} file(s) would be migrated`;
  } else if (failed > 0) {
    message = `Migrated ${migrated} file(s), ${failed} failed`;
  } else if (migrated > 0) {
    message = `Migrated ${migrated} file(s) to cloud storage`;
  } else {
    message = 'No files to migrate';
  }

  return {
    migrated,
    failed,
    migratedAt: new Date().toISOString(),
    migratedFiles,
    failedFiles,
    dryRun,
    message,
  };
}
