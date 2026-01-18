/**
 * @fractary/core - Docs Module Types
 *
 * Type definitions for documentation management.
 */

/**
 * Documentation format types
 */
export type DocFormat = 'markdown' | 'html' | 'pdf' | 'text';

/**
 * Metadata storage mode
 * - 'frontmatter': Metadata embedded in YAML frontmatter at start of markdown files (recommended)
 * - 'sidecar': Metadata stored in separate .meta.yaml files alongside content files (legacy)
 */
export type MetadataMode = 'frontmatter' | 'sidecar';

/**
 * Documentation metadata
 */
export interface DocMetadata {
  /**
   * Document title
   */
  title: string;

  /**
   * Document description
   */
  description?: string;

  /**
   * Document author(s)
   */
  authors?: string[];

  /**
   * Creation date
   */
  createdAt?: Date;

  /**
   * Last updated date
   */
  updatedAt?: Date;

  /**
   * Document version
   */
  version?: string;

  /**
   * Tags for categorization
   */
  tags?: string[];

  /**
   * Document type (e.g., 'adr', 'api', 'architecture')
   */
  docType?: string;

  /**
   * Document status (e.g., 'draft', 'published', 'deprecated')
   */
  status?: string;

  /**
   * Custom metadata
   */
  [key: string]: unknown;
}

/**
 * Documentation item
 */
export interface Doc {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Document content
   */
  content: string;

  /**
   * Document format
   */
  format: DocFormat;

  /**
   * Document metadata
   */
  metadata: DocMetadata;

  /**
   * File path (if stored on disk)
   */
  path?: string;
}

/**
 * Documentation search query
 */
export interface DocSearchQuery {
  /**
   * Search text
   */
  text?: string;

  /**
   * Filter by tags
   */
  tags?: string[];

  /**
   * Filter by author
   */
  author?: string;

  /**
   * Filter by document type
   */
  docType?: string;

  /**
   * Filter by date range
   */
  dateRange?: {
    from?: Date;
    to?: Date;
  };

  /**
   * Limit results
   */
  limit?: number;
}

/**
 * Configuration for docs manager
 */
export interface DocsManagerConfig {
  /**
   * Base directory for documentation storage
   */
  docsDir: string;

  /**
   * Default format for new documents
   */
  defaultFormat?: DocFormat;

  /**
   * Metadata storage mode (default: 'frontmatter' for markdown, 'sidecar' for others)
   */
  metadataMode?: MetadataMode;
}

/**
 * Document type definition
 */
export interface DocType {
  /**
   * Type identifier (e.g., 'adr', 'api', 'architecture')
   */
  id: string;

  /**
   * Human-readable name
   */
  displayName: string;

  /**
   * Description of this document type
   */
  description: string;

  /**
   * Mustache template for document content
   */
  template: string;

  /**
   * Default output path relative to docs directory
   */
  outputPath: string;

  /**
   * File naming configuration
   */
  fileNaming: {
    pattern: string;
    autoNumber?: boolean;
    numberFormat?: string;
    slugSource?: string;
    slugMaxLength?: number;
  };

  /**
   * Frontmatter field configuration
   */
  frontmatter: {
    requiredFields: string[];
    optionalFields?: string[];
    defaults?: Record<string, unknown>;
  };

  /**
   * Document structure requirements
   */
  structure?: {
    requiredSections?: string[];
    optionalSections?: string[];
    sectionOrder?: string[];
  };

  /**
   * Status field configuration
   */
  status?: {
    allowedValues: string[];
    default: string;
  };

  /**
   * Index configuration
   */
  indexConfig?: {
    indexFile: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    entryTemplate?: string;
  };

  /**
   * Documentation standards (markdown content)
   */
  standards?: string;
}
