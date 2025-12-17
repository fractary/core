import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { FileManager } from '@fractary/core/file';
import { minimatch } from 'minimatch';
import { Config } from '../config.js';
import { successResult, errorResult } from './helpers.js';
import { validatePath } from './security.js';

/**
 * Handler for fractary_file_read
 */
export async function handleFileRead(
  params: {
    path: string;
    encoding?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const basePath = config.file?.basePath || '.fractary/files';

    // Validate path to prevent directory traversal
    const safePath = validatePath(params.path, basePath);

    const manager = new FileManager({ basePath });
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
    encoding?: string;
    overwrite?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const basePath = config.file?.basePath || '.fractary/files';

    // Validate path to prevent directory traversal
    const safePath = validatePath(params.path, basePath);

    const manager = new FileManager({ basePath });

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
    pattern?: string;
    recursive?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const basePath = config.file?.basePath || '.fractary/files';

    // Validate path to prevent directory traversal (if provided)
    const safePath = params.path ? validatePath(params.path, basePath) : undefined;

    const manager = new FileManager({ basePath });
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
  params: { path: string },
  config: Config
): Promise<CallToolResult> {
  try {
    const basePath = config.file?.basePath || '.fractary/files';

    // Validate path to prevent directory traversal
    const safePath = validatePath(params.path, basePath);

    const manager = new FileManager({ basePath });
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
  params: { path: string },
  config: Config
): Promise<CallToolResult> {
  try {
    const basePath = config.file?.basePath || '.fractary/files';

    // Validate path to prevent directory traversal
    const safePath = validatePath(params.path, basePath);

    const manager = new FileManager({ basePath });
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
    overwrite?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const basePath = config.file?.basePath || '.fractary/files';

    // Validate both source and destination paths to prevent directory traversal
    const safeSource = validatePath(params.source, basePath);
    const safeDestination = validatePath(params.destination, basePath);

    const manager = new FileManager({ basePath });

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
    overwrite?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const basePath = config.file?.basePath || '.fractary/files';

    // Validate both source and destination paths to prevent directory traversal
    const safeSource = validatePath(params.source, basePath);
    const safeDestination = validatePath(params.destination, basePath);

    const manager = new FileManager({ basePath });

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
