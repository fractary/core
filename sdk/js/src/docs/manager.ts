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
  MetadataMode,
} from './types';

/**
 * Frontmatter parsing result
 */
interface FrontmatterResult {
  metadata: DocMetadata;
  body: string;
}

/**
 * Documentation Manager - Create, manage, and search documentation
 */
export class DocsManager {
  private docsDir: string;
  private defaultFormat: DocFormat;
  private metadataMode: MetadataMode;

  constructor(config: DocsManagerConfig) {
    this.docsDir = config.docsDir;
    this.defaultFormat = config.defaultFormat || 'markdown';
    this.metadataMode = config.metadataMode || 'frontmatter';
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
   * Determine the effective metadata mode for a document format
   * Frontmatter only makes sense for markdown files
   */
  private getEffectiveMetadataMode(format: DocFormat): MetadataMode {
    if (format !== 'markdown') {
      return 'sidecar';
    }
    return this.metadataMode;
  }

  /**
   * Parse frontmatter from markdown content
   */
  private parseFrontmatter(content: string): FrontmatterResult {
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      // No frontmatter found, return content as-is with minimal metadata
      return {
        metadata: { title: '' },
        body: content,
      };
    }

    const frontmatterContent = match[1];
    const body = match[2];

    let metadata: DocMetadata;
    try {
      const parsed = yaml.load(frontmatterContent) as Record<string, unknown>;
      metadata = {
        title: (parsed.title as string) || '',
        description: parsed.description as string | undefined,
        authors: parsed.authors as string[] | undefined,
        tags: parsed.tags as string[] | undefined,
        docType: parsed.docType as string | undefined,
        status: parsed.status as string | undefined,
        version: parsed.version as string | undefined,
      };

      // Parse dates
      if (parsed.createdAt) {
        metadata.createdAt = new Date(parsed.createdAt as string);
      }
      if (parsed.updatedAt) {
        metadata.updatedAt = new Date(parsed.updatedAt as string);
      }

      // Copy any additional fields
      for (const [key, value] of Object.entries(parsed)) {
        if (!(key in metadata)) {
          metadata[key] = value;
        }
      }
    } catch {
      metadata = { title: '' };
    }

    return { metadata, body };
  }

  /**
   * Write frontmatter to markdown content
   */
  private writeFrontmatter(metadata: DocMetadata, body: string): string {
    // Prepare metadata object for YAML serialization
    const yamlMetadata: Record<string, unknown> = {};

    // Add standard fields
    if (metadata.title) yamlMetadata.title = metadata.title;
    if (metadata.description) yamlMetadata.description = metadata.description;
    if (metadata.authors && metadata.authors.length > 0) yamlMetadata.authors = metadata.authors;
    if (metadata.tags && metadata.tags.length > 0) yamlMetadata.tags = metadata.tags;
    if (metadata.docType) yamlMetadata.docType = metadata.docType;
    if (metadata.status) yamlMetadata.status = metadata.status;
    if (metadata.version) yamlMetadata.version = metadata.version;

    // Add dates
    if (metadata.createdAt) {
      yamlMetadata.createdAt = metadata.createdAt instanceof Date
        ? metadata.createdAt.toISOString()
        : metadata.createdAt;
    }
    if (metadata.updatedAt) {
      yamlMetadata.updatedAt = metadata.updatedAt instanceof Date
        ? metadata.updatedAt.toISOString()
        : metadata.updatedAt;
    }

    // Add any additional custom fields
    for (const [key, value] of Object.entries(metadata)) {
      if (
        value !== undefined &&
        !['title', 'description', 'authors', 'tags', 'docType', 'status', 'version', 'createdAt', 'updatedAt'].includes(key)
      ) {
        yamlMetadata[key] = value;
      }
    }

    const frontmatter = yaml.dump(yamlMetadata, { lineWidth: -1 });
    return `---\n${frontmatter}---\n\n${body}`;
  }

  /**
   * Extract body content from content that may have frontmatter
   */
  private extractBody(content: string): string {
    const result = this.parseFrontmatter(content);
    return result.body;
  }

  /**
   * Create a new document
   * @param id - Document identifier
   * @param content - Document body content (without frontmatter)
   * @param metadata - Document metadata
   * @param format - Document format (default: markdown)
   */
  async createDoc(
    id: string,
    content: string,
    metadata: DocMetadata,
    format?: DocFormat
  ): Promise<Doc> {
    const docFormat = format || this.defaultFormat;
    const docPath = this.getDocPath(id, docFormat);
    const effectiveMode = this.getEffectiveMetadataMode(docFormat);

    // Add timestamps
    const fullMetadata: DocMetadata = {
      ...metadata,
      createdAt: metadata.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Extract body content in case content already has frontmatter
    const bodyContent = this.extractBody(content);

    if (effectiveMode === 'frontmatter') {
      // Write content with embedded frontmatter
      const fullContent = this.writeFrontmatter(fullMetadata, bodyContent);
      fs.writeFileSync(docPath, fullContent, 'utf-8');
    } else {
      // Sidecar mode: separate content and metadata files
      const metaPath = this.getMetadataPath(id);
      fs.writeFileSync(docPath, bodyContent, 'utf-8');
      fs.writeFileSync(metaPath, yaml.dump(fullMetadata), 'utf-8');
    }

    return {
      id,
      content: bodyContent,
      format: docFormat,
      metadata: fullMetadata,
      path: docPath,
    };
  }

  /**
   * Get a document by ID
   * Supports both frontmatter and sidecar metadata modes
   */
  async getDoc(id: string): Promise<Doc | null> {
    // Try to find the doc with any format
    const formats: DocFormat[] = ['markdown', 'html', 'pdf', 'text'];

    for (const format of formats) {
      const docPath = this.getDocPath(id, format);
      if (fs.existsSync(docPath)) {
        const rawContent = fs.readFileSync(docPath, 'utf-8');
        const effectiveMode = this.getEffectiveMetadataMode(format);
        let metadata: DocMetadata = { title: id };
        let content: string;

        if (effectiveMode === 'frontmatter') {
          // Parse frontmatter from content
          const result = this.parseFrontmatter(rawContent);
          metadata = result.metadata.title ? result.metadata : { ...metadata, ...result.metadata };
          content = result.body;
        } else {
          // Sidecar mode: check for .meta.yaml file
          content = rawContent;
          const metaPath = this.getMetadataPath(id);
          if (fs.existsSync(metaPath)) {
            const metaContent = fs.readFileSync(metaPath, 'utf-8');
            metadata = yaml.load(metaContent) as DocMetadata;
          }
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
   * @param id - Document identifier
   * @param content - New body content (without frontmatter)
   * @param metadata - Metadata fields to update (merged with existing)
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
    const effectiveMode = this.getEffectiveMetadataMode(existingDoc.format);

    // Extract body content in case content already has frontmatter
    const bodyContent = this.extractBody(content);

    if (effectiveMode === 'frontmatter') {
      // Write content with embedded frontmatter
      const fullContent = this.writeFrontmatter(updatedMetadata, bodyContent);
      fs.writeFileSync(docPath, fullContent, 'utf-8');
    } else {
      // Sidecar mode: separate content and metadata files
      const metaPath = this.getMetadataPath(id);
      fs.writeFileSync(docPath, bodyContent, 'utf-8');
      fs.writeFileSync(metaPath, yaml.dump(updatedMetadata), 'utf-8');
    }

    return {
      id,
      content: bodyContent,
      format: existingDoc.format,
      metadata: updatedMetadata,
      path: docPath,
    };
  }

  /**
   * Delete a document
   * Removes both the document file and any sidecar metadata file if it exists
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

    // Also delete sidecar metadata file if it exists (for backward compatibility)
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

    // Filter by docType
    if (query.docType) {
      results = results.filter((doc) => doc.metadata.docType === query.docType);
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
