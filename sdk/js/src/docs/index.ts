/**
 * @fractary/core - Docs Module
 *
 * Documentation management and organization.
 */

export { DocsManager } from './manager';
export { DocTypeRegistry } from './type-registry';
export type { CustomDocTypeConfig, DocTypeRegistryConfig } from './type-registry';
export * from './types';

// Re-export individual doc types for convenience
export {
  adrType,
  apiType,
  architectureType,
  auditType,
  changelogType,
  datasetType,
  etlType,
  guidesType,
  infrastructureType,
  standardsType,
  testingType,
} from './types/index';
