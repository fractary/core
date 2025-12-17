import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { DocsManager } from '@fractary/core/docs';
import { Config } from '../config.js';
import { successResult, errorResult } from './helpers.js';

/**
 * Handler for fractary_docs_create
 */
export async function handleDocsCreate(
  params: {
    id: string;
    title: string;
    content: string;
    type?: string;
    tags?: string[];
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new DocsManager({ docsDir: config.docs?.docsDir || '.fractary/docs' });
    const doc = await manager.createDoc(
      params.id,
      params.content,
      {
        title: params.title,
        type: params.type,
        tags: params.tags || [],
      },
      'markdown'
    );
    return successResult(doc);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error creating doc: ${message}`);
  }
}

/**
 * Handler for fractary_docs_update
 */
export async function handleDocsUpdate(
  params: {
    id: string;
    title?: string;
    content?: string;
    tags?: string[];
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new DocsManager({ docsDir: config.docs?.docsDir || '.fractary/docs' });

    const metadata: { title?: string; tags?: string[] } = {};
    if (params.title) metadata.title = params.title;
    if (params.tags) metadata.tags = params.tags;

    const doc = await manager.updateDoc(params.id, params.content || '', metadata);

    if (!doc) {
      return errorResult(`Doc not found: ${params.id}`);
    }

    return successResult(doc);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error updating doc: ${message}`);
  }
}

/**
 * Handler for fractary_docs_search
 */
export async function handleDocsSearch(
  params: {
    text?: string;
    tags?: string[];
    author?: string;
    limit?: number;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new DocsManager({ docsDir: config.docs?.docsDir || '.fractary/docs' });
    const docs = await manager.searchDocs({
      text: params.text,
      tags: params.tags,
      author: params.author,
      limit: params.limit,
    });
    return successResult(docs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error searching docs: ${message}`);
  }
}

/**
 * Handler for fractary_docs_export
 */
export async function handleDocsExport(
  params: {
    id: string;
    format?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new DocsManager({ docsDir: config.docs?.docsDir || '.fractary/docs' });
    const doc = await manager.getDoc(params.id);

    if (!doc) {
      return errorResult(`Doc not found: ${params.id}`);
    }

    // For now, just return the doc content
    // In a full implementation, this would convert to the requested format
    return successResult({
      id: params.id,
      format: params.format || 'markdown',
      content: doc.content,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error exporting doc: ${message}`);
  }
}

/**
 * Handler for fractary_docs_list
 */
export async function handleDocsList(
  params: {
    tags?: string[];
    author?: string;
    limit?: number;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new DocsManager({ docsDir: config.docs?.docsDir || '.fractary/docs' });
    const docs = await manager.listDocs();

    // Apply filters
    let filteredDocs = docs;

    if (params.author) {
      filteredDocs = filteredDocs.filter(doc =>
        doc.metadata.authors?.includes(params.author!)
      );
    }

    if (params.tags && params.tags.length > 0) {
      filteredDocs = filteredDocs.filter(doc =>
        params.tags!.some(tag => doc.metadata.tags?.includes(tag))
      );
    }

    if (params.limit) {
      filteredDocs = filteredDocs.slice(0, params.limit);
    }

    return successResult(filteredDocs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error listing docs: ${message}`);
  }
}

/**
 * Handler for fractary_docs_read
 */
export async function handleDocsRead(
  params: { id: string },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new DocsManager({ docsDir: config.docs?.docsDir || '.fractary/docs' });
    const doc = await manager.getDoc(params.id);

    if (!doc) {
      return errorResult(`Doc not found: ${params.id}`);
    }

    return successResult(doc);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error reading doc: ${message}`);
  }
}

/**
 * Handler for fractary_docs_delete
 */
export async function handleDocsDelete(
  params: { id: string },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new DocsManager({ docsDir: config.docs?.docsDir || '.fractary/docs' });
    const deleted = await manager.deleteDoc(params.id);

    if (!deleted) {
      return errorResult(`Doc not found: ${params.id}`);
    }

    return successResult({ id: params.id, deleted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error deleting doc: ${message}`);
  }
}
