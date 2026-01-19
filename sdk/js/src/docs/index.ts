/**
 * @fractary/core - Docs Module
 *
 * Documentation management and organization.
 *
 * Doc types are now stored as YAML/Markdown files in the doc-types/ directory
 * at the repository root. Use DocTypeRegistry to load and access them.
 */

export { DocsManager } from './manager';
export { DocTypeRegistry } from './type-registry';
export type { CustomDocTypeConfig, DocTypeRegistryConfig } from './type-registry';
export * from './types';
