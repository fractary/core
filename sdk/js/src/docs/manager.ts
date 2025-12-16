/**
 * @fractary/core - Docs Manager
 *
 * Documentation management and organization.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {
  Doc,
  DocFormat,
  DocMetadata,
  DocSearchQuery,
  DocsManagerConfig,
} from './types';

/**
 * Documentation Manager - Create, manage, and search documentation
 */
export class DocsManager {
  private docsDir: string;
  private defaultFormat: DocFormat;

  constructor(config: DocsManagerConfig) {
    this.docsDir = config.docsDir;
    this.defaultFormat = config.defaultFormat || 'markdown';
    this.ensureDir(this.docsDir);
  }

  private ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private getDocPath(id: string, format: DocFormat): string {
    const ext = this.getFileExtension(format);
    return path.join(this.docsDir, `${id}${ext}`);
  }

  private getMetadataPath(id: string): string {
    return path.join(this.docsDir, `${id}.meta.yaml`);
  }

  private getFileExtension(format: DocFormat): string {
    const extensions: Record<DocFormat, string> = {
      markdown: '.md',
      html: '.html',
      pdf: '.pdf',
      text: '.txt',
    };
    return extensions[format];
  }

  /**
   * Create a new document
   */
  async createDoc(
    id: string,
    content: string,
    metadata: DocMetadata,
    format?: DocFormat
  ): Promise<Doc> {
    const docFormat = format || this.defaultFormat;
    const docPath = this.getDocPath(id, docFormat);
    const metaPath = this.getMetadataPath(id);

    // Add timestamps
    const fullMetadata: DocMetadata = {
      ...metadata,
      createdAt: metadata.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Write content
    fs.writeFileSync(docPath, content, 'utf-8');

    // Write metadata
    fs.writeFileSync(metaPath, yaml.dump(fullMetadata), 'utf-8');

    return {
      id,
      content,
      format: docFormat,
      metadata: fullMetadata,
      path: docPath,
    };
  }

  /**
   * Get a document by ID
   */
  async getDoc(id: string): Promise<Doc | null> {
    // Try to find the doc with any format
    const formats: DocFormat[] = ['markdown', 'html', 'pdf', 'text'];

    for (const format of formats) {
      const docPath = this.getDocPath(id, format);
      if (fs.existsSync(docPath)) {
        const content = fs.readFileSync(docPath, 'utf-8');
        const metaPath = this.getMetadataPath(id);
        let metadata: DocMetadata = { title: id };

        if (fs.existsSync(metaPath)) {
          const metaContent = fs.readFileSync(metaPath, 'utf-8');
          metadata = yaml.load(metaContent) as DocMetadata;
        }

        return {
          id,
          content,
          format,
          metadata,
          path: docPath,
        };
      }
    }

    return null;
  }

  /**
   * Update a document
   */
  async updateDoc(
    id: string,
    content: string,
    metadata?: Partial<DocMetadata>
  ): Promise<Doc | null> {
    const existingDoc = await this.getDoc(id);
    if (!existingDoc) {
      return null;
    }

    const updatedMetadata: DocMetadata = {
      ...existingDoc.metadata,
      ...metadata,
      updatedAt: new Date(),
    };

    const docPath = this.getDocPath(id, existingDoc.format);
    const metaPath = this.getMetadataPath(id);

    fs.writeFileSync(docPath, content, 'utf-8');
    fs.writeFileSync(metaPath, yaml.dump(updatedMetadata), 'utf-8');

    return {
      id,
      content,
      format: existingDoc.format,
      metadata: updatedMetadata,
      path: docPath,
    };
  }

  /**
   * Delete a document
   */
  async deleteDoc(id: string): Promise<boolean> {
    const doc = await this.getDoc(id);
    if (!doc) {
      return false;
    }

    const docPath = this.getDocPath(id, doc.format);
    const metaPath = this.getMetadataPath(id);

    if (fs.existsSync(docPath)) {
      fs.unlinkSync(docPath);
    }

    if (fs.existsSync(metaPath)) {
      fs.unlinkSync(metaPath);
    }

    return true;
  }

  /**
   * List all documents
   */
  async listDocs(): Promise<Doc[]> {
    if (!fs.existsSync(this.docsDir)) {
      return [];
    }

    const files = fs.readdirSync(this.docsDir);
    const docIds = new Set<string>();

    // Extract unique document IDs (remove extensions and .meta)
    for (const file of files) {
      if (file.endsWith('.meta.yaml')) {
        continue;
      }
      const id = file.replace(/\.(md|html|pdf|txt)$/, '');
      docIds.add(id);
    }

    const docs: Doc[] = [];
    for (const id of docIds) {
      const doc = await this.getDoc(id);
      if (doc) {
        docs.push(doc);
      }
    }

    return docs;
  }

  /**
   * Search documents
   */
  async searchDocs(query: DocSearchQuery): Promise<Doc[]> {
    const allDocs = await this.listDocs();
    let results = allDocs;

    // Filter by text
    if (query.text) {
      const searchText = query.text.toLowerCase();
      results = results.filter(
        (doc) =>
          doc.content.toLowerCase().includes(searchText) ||
          doc.metadata.title.toLowerCase().includes(searchText) ||
          doc.metadata.description?.toLowerCase().includes(searchText)
      );
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter((doc) =>
        query.tags!.some((tag) => doc.metadata.tags?.includes(tag))
      );
    }

    // Filter by author
    if (query.author) {
      results = results.filter((doc) =>
        doc.metadata.authors?.includes(query.author!)
      );
    }

    // Filter by date range
    if (query.dateRange) {
      results = results.filter((doc) => {
        const docDate = doc.metadata.updatedAt || doc.metadata.createdAt;
        if (!docDate) return false;

        const date = new Date(docDate);
        if (query.dateRange!.from && date < query.dateRange!.from) {
          return false;
        }
        if (query.dateRange!.to && date > query.dateRange!.to) {
          return false;
        }
        return true;
      });
    }

    // Apply limit
    if (query.limit && query.limit > 0) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Check if a document exists
   */
  async docExists(id: string): Promise<boolean> {
    const doc = await this.getDoc(id);
    return doc !== null;
  }
}
