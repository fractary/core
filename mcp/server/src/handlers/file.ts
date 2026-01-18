import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { FileManager, createStorageFromSource } from '@fractary/core/file';
import type { StorageConfig, SourceConfig } from '@fractary/core/file';
import { minimatch } from 'minimatch';
import { Config } from '../config.js';
import { successResult, errorResult } from './helpers.js';
import { validatePath } from './security.js';

/**
 * Create a FileManager based on config
 *
 * Supports:
 * 1. Named source from config.file.sources
 * 2. Direct storage config
 * 3. Base path (local storage)
 */
function createFileManager(
  config: Config,
  options?: { source?: string; storageConfig?: StorageConfig }
): FileManager {
  // If a specific source is requested
  if (options?.source && config.file?.sources?.[options.source]) {
    const storage = createStorageFromSource(options.source, {
      sources: config.file.sources as Record<string, SourceConfig>,
    });
    return new FileManager({ storage });
  }

  // If direct storage config is provided
  if (options?.storageConfig) {
    return new FileManager({ storageConfig: options.storageConfig });
  }

  // Default: local storage
  const basePath = config.file?.basePath || '.fractary/files';
  return new FileManager({ basePath });
}

/**
 * Handler for fractary_file_read
 */
export async function handleFileRead(
  params: {
    path: string;
    source?: string;
    encoding?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const basePath = config.file?.basePath || '.fractary/files';

    // Validate path to prevent directory traversal (only for local storage)
    const safePath = params.source ? params.path : validatePath(params.path, basePath);

    const manager = createFileManager(config, { source: params.source });
    const content = await manager.read(safePath);
    return successResult({ path: safePath, content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error reading file: ${message}`);
  }
}

/**
 * Handler for fractary_file_write
 */
export async function handleFileWrite(
  params: {
    path: string;
    content: string;
    source?: string;
    encoding?: string;
    overwrite?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const basePath = config.file?.basePath || '.fractary/files';

    // Validate path to prevent directory traversal (only for local storage)
    const safePath = params.source ? params.path : validatePath(params.path, basePath);

    const manager = createFileManager(config, { source: params.source });

    // Check if file exists and overwrite is false
    if (params.overwrite === false) {
      const exists = await manager.exists(safePath);
      if (exists) {
        return errorResult(`File already exists and overwrite is false: ${safePath}`);
      }
    }

    const path = await manager.write(safePath, params.content);
    return successResult({ path, written: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error writing file: ${message}`);
  }
}

/**
 * Handler for fractary_file_list
 */
export async function handleFileList(
  params: {
    path?: string;
    source?: string;
    pattern?: string;
    recursive?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const basePath = config.file?.basePath || '.fractary/files';

    // Validate path to prevent directory traversal (if provided and local storage)
    const safePath = params.path
      ? params.source
        ? params.path
        : validatePath(params.path, basePath)
      : undefined;

    const manager = createFileManager(config, { source: params.source });
    const files = await manager.list(safePath);

    // Apply pattern filtering if provided using safe minimatch library
    let filteredFiles = files;
    if (params.pattern) {
      // Use minimatch for safe glob pattern matching (prevents ReDoS attacks)
      filteredFiles = files.filter((file: string) => minimatch(file, params.pattern as string));
    }

    return successResult({ files: filteredFiles, count: filteredFiles.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error listing files: ${message}`);
  }
}

/**
 * Handler for fractary_file_delete
 */
export async function handleFileDelete(
  params: { path: string; source?: string },
  config: Config
): Promise<CallToolResult> {
  try {
    const basePath = config.file?.basePath || '.fractary/files';

    // Validate path to prevent directory traversal (only for local storage)
    const safePath = params.source ? params.path : validatePath(params.path, basePath);

    const manager = createFileManager(config, { source: params.source });
    await manager.delete(safePath);
    return successResult({ path: safePath, deleted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error deleting file: ${message}`);
  }
}

/**
 * Handler for fractary_file_exists
 */
export async function handleFileExists(
  params: { path: string; source?: string },
  config: Config
): Promise<CallToolResult> {
  try {
    const basePath = config.file?.basePath || '.fractary/files';

    // Validate path to prevent directory traversal (only for local storage)
    const safePath = params.source ? params.path : validatePath(params.path, basePath);

    const manager = createFileManager(config, { source: params.source });
    const exists = await manager.exists(safePath);
    return successResult({ path: safePath, exists });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error checking file existence: ${message}`);
  }
}

/**
 * Handler for fractary_file_copy
 */
export async function handleFileCopy(
  params: {
    source: string;
    destination: string;
    sourceStorage?: string;
    overwrite?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const basePath = config.file?.basePath || '.fractary/files';

    // Validate both source and destination paths to prevent directory traversal (only for local)
    const safeSource = params.sourceStorage
      ? params.source
      : validatePath(params.source, basePath);
    const safeDestination = params.sourceStorage
      ? params.destination
      : validatePath(params.destination, basePath);

    const manager = createFileManager(config, { source: params.sourceStorage });

    // Check if destination exists and overwrite is false
    if (params.overwrite === false) {
      const exists = await manager.exists(safeDestination);
      if (exists) {
        return errorResult(`Destination already exists and overwrite is false: ${safeDestination}`);
      }
    }

    const path = await manager.copy(safeSource, safeDestination);
    return successResult({ source: safeSource, destination: path, copied: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error copying file: ${message}`);
  }
}

/**
 * Handler for fractary_file_move
 */
export async function handleFileMove(
  params: {
    source: string;
    destination: string;
    sourceStorage?: string;
    overwrite?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const basePath = config.file?.basePath || '.fractary/files';

    // Validate both source and destination paths to prevent directory traversal (only for local)
    const safeSource = params.sourceStorage
      ? params.source
      : validatePath(params.source, basePath);
    const safeDestination = params.sourceStorage
      ? params.destination
      : validatePath(params.destination, basePath);

    const manager = createFileManager(config, { source: params.sourceStorage });

    // Check if destination exists and overwrite is false
    if (params.overwrite === false) {
      const exists = await manager.exists(safeDestination);
      if (exists) {
        return errorResult(`Destination already exists and overwrite is false: ${safeDestination}`);
      }
    }

    const path = await manager.move(safeSource, safeDestination);
    return successResult({ source: safeSource, destination: path, moved: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error moving file: ${message}`);
  }
}

/**
 * Handler for fractary_file_get_url
 */
export async function handleFileGetUrl(
  params: {
    path: string;
    source?: string;
    expiresIn?: number;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = createFileManager(config, { source: params.source });
    const url = await manager.getUrl(params.path, params.expiresIn);

    if (url) {
      return successResult({ path: params.path, url });
    } else {
      return errorResult('URL generation not supported for this storage type');
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error getting file URL: ${message}`);
  }
}
