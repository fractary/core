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
}
