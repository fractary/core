/**
 * @fractary/core - Core Primitives SDK
 *
 * Primitive operations for work tracking, repository management,
 * specifications, logging, file storage, and documentation.
 *
 * This package provides the foundational SDKs for:
 * - Work tracking across GitHub Issues, Jira, and Linear
 * - Repository operations with Git, GitHub, GitLab, and Bitbucket
 * - Specification management and templates
 * - Logging and session capture
 * - File storage operations
 * - Documentation management
 */

// Auto-load .env files on import
import 'dotenv/config';

// Authentication primitives
export * from './auth';

// Configuration loading
export * from './config';

// Manager factories
export * from './factories';

// Work tracking primitives
export * from './work';

// Repository management primitives
export * from './repo';

// Specification management primitives
export * from './spec';

// Logging primitives
export * from './logs';

// File storage primitives
export * from './file';

// Documentation primitives
export * from './docs';
