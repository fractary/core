import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { FileManager } from '@fractary/core/file';
import { Config } from '../config.js';
import { successResult, errorResult } from './helpers.js';

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
    const manager = new FileManager({ basePath: config.file?.basePath || '.fractary/files' });
    const content = await manager.read(params.path);
    return successResult({ path: params.path, content });
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
    const manager = new FileManager({ basePath: config.file?.basePath || '.fractary/files' });

    // Check if file exists and overwrite is false
    if (params.overwrite === false) {
      const exists = await manager.exists(params.path);
      if (exists) {
        return errorResult(`File already exists and overwrite is false: ${params.path}`);
      }
    }

    const path = await manager.write(params.path, params.content);
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
    const manager = new FileManager({ basePath: config.file?.basePath || '.fractary/files' });
    const files = await manager.list(params.path);

    // Apply pattern filtering if provided (simple glob matching)
    let filteredFiles = files;
    if (params.pattern) {
      const regex = new RegExp(params.pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
      filteredFiles = files.filter((file: string) => regex.test(file));
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
    const manager = new FileManager({ basePath: config.file?.basePath || '.fractary/files' });
    await manager.delete(params.path);
    return successResult({ path: params.path, deleted: true });
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
    const manager = new FileManager({ basePath: config.file?.basePath || '.fractary/files' });
    const exists = await manager.exists(params.path);
    return successResult({ path: params.path, exists });
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
    const manager = new FileManager({ basePath: config.file?.basePath || '.fractary/files' });

    // Check if destination exists and overwrite is false
    if (params.overwrite === false) {
      const exists = await manager.exists(params.destination);
      if (exists) {
        return errorResult(`Destination already exists and overwrite is false: ${params.destination}`);
      }
    }

    const path = await manager.copy(params.source, params.destination);
    return successResult({ source: params.source, destination: path, copied: true });
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
    const manager = new FileManager({ basePath: config.file?.basePath || '.fractary/files' });

    // Check if destination exists and overwrite is false
    if (params.overwrite === false) {
      const exists = await manager.exists(params.destination);
      if (exists) {
        return errorResult(`Destination already exists and overwrite is false: ${params.destination}`);
      }
    }

    const path = await manager.move(params.source, params.destination);
    return successResult({ source: params.source, destination: path, moved: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error moving file: ${message}`);
  }
}
