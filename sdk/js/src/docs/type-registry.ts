/**
 * @fractary/core - Doc Type Registry
 *
 * Manages document type definitions for structured documentation.
 * Loads core types bundled with SDK and custom types from config.
 */

import * as fs from 'fs';
import * as path from 'path';
import { DocType } from './types';

// Core doc types bundled with SDK
import { adrType } from './types/adr';
import { apiType } from './types/api';
import { architectureType } from './types/architecture';
import { auditType } from './types/audit';
import { changelogType } from './types/changelog';
import { datasetType } from './types/dataset';
import { etlType } from './types/etl';
import { guidesType } from './types/guides';
import { infrastructureType } from './types/infrastructure';
import { standardsType } from './types/standards';
import { testingType } from './types/testing';

/**
 * Configuration for custom doc types
 */
export interface CustomDocTypeConfig {
  id: string;
  path: string;
}

/**
 * Registry configuration
 */
export interface DocTypeRegistryConfig {
  /**
   * Custom doc types to load from config
   */
  customTypes?: CustomDocTypeConfig[];

  /**
   * Base directory for resolving relative paths
   */
  baseDir?: string;
}

/**
 * Doc Type Registry - Load and manage document type definitions
 */
export class DocTypeRegistry {
  private coreTypes: Map<string, DocType>;
  private customTypes: Map<string, DocType>;
  private baseDir: string;

  constructor(config?: DocTypeRegistryConfig) {
    this.baseDir = config?.baseDir || process.cwd();
    this.coreTypes = new Map();
    this.customTypes = new Map();

    // Load core types
    this.loadCoreTypes();

    // Load custom types if provided
    if (config?.customTypes) {
      this.loadCustomTypes(config.customTypes);
    }
  }

  /**
   * Load all core doc types bundled with SDK
   */
  private loadCoreTypes(): void {
    const coreTypeList: DocType[] = [
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
    ];

    for (const docType of coreTypeList) {
      this.coreTypes.set(docType.id, docType);
    }
  }

  /**
   * Load custom types from config paths
   */
  private loadCustomTypes(configs: CustomDocTypeConfig[]): void {
    for (const config of configs) {
      try {
        const typePath = path.isAbsolute(config.path)
          ? config.path
          : path.join(this.baseDir, config.path);

        if (!fs.existsSync(typePath)) {
          console.warn(`Custom doc type not found: ${typePath}`);
          continue;
        }

        const content = fs.readFileSync(typePath, 'utf-8');
        const docType = JSON.parse(content) as DocType;

        // Ensure the ID matches
        if (docType.id !== config.id) {
          console.warn(`Custom doc type ID mismatch: expected ${config.id}, got ${docType.id}`);
          docType.id = config.id;
        }

        this.customTypes.set(docType.id, docType);
      } catch (error) {
        console.warn(`Failed to load custom doc type ${config.id}:`, error);
      }
    }
  }

  /**
   * Get all available doc types (core + custom)
   */
  getAllTypes(): DocType[] {
    const types: DocType[] = [];

    // Add core types
    for (const docType of this.coreTypes.values()) {
      types.push(docType);
    }

    // Add custom types (may override core types)
    for (const docType of this.customTypes.values()) {
      const existingIndex = types.findIndex((t) => t.id === docType.id);
      if (existingIndex >= 0) {
        types[existingIndex] = docType;
      } else {
        types.push(docType);
      }
    }

    return types.sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Get a doc type by ID
   */
  getType(id: string): DocType | null {
    // Custom types take precedence
    if (this.customTypes.has(id)) {
      return this.customTypes.get(id)!;
    }

    return this.coreTypes.get(id) || null;
  }

  /**
   * Check if a doc type exists
   */
  hasType(id: string): boolean {
    return this.coreTypes.has(id) || this.customTypes.has(id);
  }

  /**
   * Get only core types
   */
  getCoreTypes(): DocType[] {
    return Array.from(this.coreTypes.values()).sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Get only custom types
   */
  getCustomTypes(): DocType[] {
    return Array.from(this.customTypes.values()).sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Register a custom type programmatically
   */
  registerType(docType: DocType): void {
    this.customTypes.set(docType.id, docType);
  }

  /**
   * Unregister a custom type
   */
  unregisterType(id: string): boolean {
    return this.customTypes.delete(id);
  }
}
