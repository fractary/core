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

  /**
   * Archive configuration (opt-in per type).
   * Delegates file operations to the file plugin's named sources.
   */
  archive?: DocTypeArchiveConfig;

  /**
   * Work-linking configuration (opt-in per type).
   * Links documents to external work items (GitHub issues, etc.).
   */
  workLinking?: DocTypeWorkLinkingConfig;

  /**
   * Refinement configuration (opt-in per type).
   * Enables gap scanning, question generation, and iterative improvement.
   */
  refinement?: DocTypeRefinementConfig;

  /**
   * Fulfillment validation configuration (opt-in per type).
   * Validates whether external implementation matches the document's requirements.
   */
  fulfillment?: DocTypeFulfillmentConfig;
}

// ============================================================================
// Doc Type Opt-In Configuration Blocks
// ============================================================================

/**
 * Archive configuration for a doc type
 */
export interface DocTypeArchiveConfig {
  /** Enable archival for this doc type */
  enabled: boolean;
  /** Named file source from .fractary/config.yaml (e.g., 'archive') */
  source: string;
  /** What triggers archival */
  trigger: 'manual' | 'on_status_change' | 'on_work_complete';
  /** Status value(s) that trigger archival when trigger is on_status_change */
  triggerStatuses?: string[];
  /** Verify checksum after archive copy */
  verifyChecksum?: boolean;
  /** Delete original after successful archive */
  deleteOriginal?: boolean;
  /** Retention policy */
  retentionDays?: number | 'forever';
}

/**
 * Work-linking configuration for a doc type
 */
export interface DocTypeWorkLinkingConfig {
  /** Enable work-linking for this doc type */
  enabled: boolean;
  /** Comment on work item when document is created */
  commentOnCreate?: boolean;
  /** Comment on work item when document is archived */
  commentOnArchive?: boolean;
  /** Require work item to be closed before archiving */
  requireClosedForArchive?: boolean;
}

/**
 * Refinement configuration for a doc type
 */
export interface DocTypeRefinementConfig {
  /** Enable refinement for this doc type */
  enabled: boolean;
  /** Post refinement questions to linked work item */
  postQuestionsToWorkItem?: boolean;
  /** Maintain a changelog of refinements in the document */
  maintainChangelog?: boolean;
}

/**
 * Fulfillment validation configuration for a doc type
 */
export interface DocTypeFulfillmentConfig {
  /** Enable fulfillment validation for this doc type */
  enabled: boolean;
  /** Check acceptance criteria checkboxes */
  checkAcceptanceCriteria?: boolean;
  /** Check whether expected files were modified */
  checkFilesModified?: boolean;
  /** Check whether tests were added */
  checkTestsAdded?: boolean;
  /** Check whether docs were updated */
  checkDocsUpdated?: boolean;
}

// ============================================================================
// Operation Result Types
// ============================================================================

/**
 * Result of a document archive operation
 */
export interface DocArchiveResult {
  success: boolean;
  sourcePath: string;
  archivePath: string;
  checksum?: string;
  originalDeleted: boolean;
}

/**
 * Result of a document refinement scan
 */
export interface DocRefineResult {
  questionsGenerated: number;
  categories: string[];
  questions: DocRefinementQuestion[];
}

/**
 * A refinement question for a document
 */
export interface DocRefinementQuestion {
  id: string;
  question: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  /** The document section this question relates to */
  section?: string;
}

/**
 * Result of fulfillment validation
 */
export interface DocFulfillmentResult {
  status: 'pass' | 'partial' | 'fail';
  score: number;
  checks: Record<string, {
    status: 'pass' | 'warn' | 'fail';
    detail: string;
  }>;
  suggestions?: string[];
}
