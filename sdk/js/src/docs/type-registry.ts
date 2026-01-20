/**
 * @fractary/core - Doc Type Registry
 *
 * Manages document type definitions for structured documentation.
 * Loads core types from YAML/Markdown files and custom types from config.
 *
 * Doc types are stored as directories containing:
 * - type.yaml: Type definition (schema, frontmatter rules, file naming)
 * - template.md: Mustache template for document generation
 * - standards.md: Standards and conventions for this type
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { DocType } from './types';

/**
 * Raw YAML structure (snake_case)
 */
interface RawDocTypeYaml {
  id: string;
  display_name: string;
  description: string;
  output_path: string;
  file_naming: {
    pattern: string;
    auto_number?: boolean;
    number_format?: string;
    slug_source?: string;
    slug_max_length?: number;
  };
  frontmatter: {
    required_fields: string[];
    optional_fields?: string[];
    defaults?: Record<string, unknown>;
  };
  structure?: {
    required_sections?: string[];
    optional_sections?: string[];
    section_order?: string[];
  };
  status?: {
    allowed_values: string[];
    default: string;
  };
  index_config?: {
    index_file: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    entry_template?: string;
  };
}

/**
 * Manifest entry for a doc type
 */
interface ManifestDocType {
  id: string;
  display_name: string;
  description: string;
  path: string;
  url?: string;
}

/**
 * Manifest structure
 */
interface Manifest {
  version: string;
  base_url: string;
  doc_types: ManifestDocType[];
}

/**
 * Configuration for custom doc types
 */
export interface CustomDocTypeConfig {
  /** Type identifier */
  id: string;
  /** Local path to type directory */
  path?: string;
  /** Remote URL to type.yaml */
  url?: string;
}

/**
 * Registry configuration
 */
export interface DocTypeRegistryConfig {
  /**
   * Custom doc types to load from config (individual type configs)
   */
  customTypes?: CustomDocTypeConfig[];

  /**
   * Path to custom manifest.yaml file (loads all types from manifest)
   * This is typically set from docs.custom_templates_path in config.yaml
   */
  customManifestPath?: string;

  /**
   * Base directory for resolving relative paths
   */
  baseDir?: string;

  /**
   * Path to core templates/docs directory (defaults to bundled types)
   */
  coreTypesPath?: string;

  /**
   * Skip loading core types (useful for testing)
   */
  skipCoreTypes?: boolean;
}

/**
 * Convert raw YAML (snake_case) to DocType (camelCase)
 */
function convertYamlToDocType(
  raw: RawDocTypeYaml,
  template: string,
  standards: string
): DocType {
  return {
    id: raw.id,
    displayName: raw.display_name,
    description: raw.description,
    template,
    outputPath: raw.output_path,
    fileNaming: {
      pattern: raw.file_naming.pattern,
      autoNumber: raw.file_naming.auto_number,
      numberFormat: raw.file_naming.number_format,
      slugSource: raw.file_naming.slug_source,
      slugMaxLength: raw.file_naming.slug_max_length,
    },
    frontmatter: {
      requiredFields: raw.frontmatter.required_fields,
      optionalFields: raw.frontmatter.optional_fields,
      defaults: raw.frontmatter.defaults,
    },
    structure: raw.structure
      ? {
          requiredSections: raw.structure.required_sections,
          optionalSections: raw.structure.optional_sections,
          sectionOrder: raw.structure.section_order,
        }
      : undefined,
    status: raw.status
      ? {
          allowedValues: raw.status.allowed_values,
          default: raw.status.default,
        }
      : undefined,
    indexConfig: raw.index_config
      ? {
          indexFile: raw.index_config.index_file,
          sortBy: raw.index_config.sort_by,
          sortOrder: raw.index_config.sort_order,
          entryTemplate: raw.index_config.entry_template,
        }
      : undefined,
    standards,
  };
}

/**
 * Doc Type Registry - Load and manage document type definitions
 */
export class DocTypeRegistry {
  private coreTypes: Map<string, DocType>;
  private customTypes: Map<string, DocType>;
  private baseDir: string;
  private coreTypesPath: string;

  constructor(config?: DocTypeRegistryConfig) {
    this.baseDir = config?.baseDir || process.cwd();
    this.coreTypes = new Map();
    this.customTypes = new Map();

    // Default to looking for templates/docs relative to package root
    // When installed as a package, this should be resolved differently
    this.coreTypesPath =
      config?.coreTypesPath || this.findCoreTypesPath();

    // Load core types unless explicitly skipped
    if (!config?.skipCoreTypes) {
      this.loadCoreTypes();
    }

    // Load custom types from manifest file if provided
    if (config?.customManifestPath) {
      this.loadCustomTypesFromManifest(config.customManifestPath);
    }

    // Load individual custom types if provided (can override manifest types)
    if (config?.customTypes) {
      this.loadCustomTypes(config.customTypes);
    }
  }

  /**
   * Find the core templates/docs directory (templates/docs)
   */
  private findCoreTypesPath(): string {
    // Try common locations
    const candidates = [
      // Development: relative to SDK source
      path.resolve(__dirname, '../../../../templates/docs'),
      // Development: from repo root
      path.resolve(process.cwd(), 'templates/docs'),
      // Installed package: look in parent directories
      path.resolve(__dirname, '../../../../../templates/docs'),
      path.resolve(__dirname, '../../../../../../templates/docs'),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(path.join(candidate, 'manifest.yaml'))) {
        return candidate;
      }
    }

    // Fallback - will fail later if types not found
    return candidates[0];
  }

  /**
   * Load all core doc types from the templates/docs directory
   */
  private loadCoreTypes(): void {
    const manifestPath = path.join(this.coreTypesPath, 'manifest.yaml');

    if (!fs.existsSync(manifestPath)) {
      console.warn(`Core doc types manifest not found: ${manifestPath}`);
      return;
    }

    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
      const manifest = yaml.load(manifestContent) as Manifest;

      for (const entry of manifest.doc_types) {
        const docType = this.loadDocTypeFromDirectory(
          entry.id,
          path.join(this.coreTypesPath, entry.path.replace('./', ''))
        );
        if (docType) {
          this.coreTypes.set(docType.id, docType);
        }
      }
    } catch (error) {
      console.warn('Failed to load core doc types:', error);
    }
  }

  /**
   * Load custom doc types from a manifest file
   * This is used when docs.custom_templates_path is set in config.yaml
   */
  private loadCustomTypesFromManifest(manifestPath: string): void {
    // Resolve path relative to baseDir if not absolute
    const resolvedPath = path.isAbsolute(manifestPath)
      ? manifestPath
      : path.join(this.baseDir, manifestPath);

    if (!fs.existsSync(resolvedPath)) {
      // Custom manifest is optional - don't warn if not found
      return;
    }

    try {
      const manifestContent = fs.readFileSync(resolvedPath, 'utf-8');
      const manifest = yaml.load(manifestContent) as Manifest;

      // Get the directory containing the manifest
      const manifestDir = path.dirname(resolvedPath);

      for (const entry of manifest.doc_types || []) {
        // Resolve type directory relative to manifest location
        const typeDirPath = path.join(manifestDir, entry.path.replace('./', ''));

        const docType = this.loadDocTypeFromDirectory(entry.id, typeDirPath);
        if (docType) {
          this.customTypes.set(docType.id, docType);
        }
      }
    } catch (error) {
      console.warn(`Failed to load custom doc types from ${manifestPath}:`, error);
    }
  }

  /**
   * Load a doc type from a directory
   */
  private loadDocTypeFromDirectory(id: string, dirPath: string): DocType | null {
    const typeYamlPath = path.join(dirPath, 'type.yaml');
    const templatePath = path.join(dirPath, 'template.md');
    const standardsPath = path.join(dirPath, 'standards.md');

    if (!fs.existsSync(typeYamlPath)) {
      console.warn(`Doc type definition not found: ${typeYamlPath}`);
      return null;
    }

    try {
      // Read type.yaml
      const typeContent = fs.readFileSync(typeYamlPath, 'utf-8');
      const rawType = yaml.load(typeContent) as RawDocTypeYaml;

      // Read template.md
      let template = '';
      if (fs.existsSync(templatePath)) {
        template = fs.readFileSync(templatePath, 'utf-8');
      }

      // Read standards.md
      let standards = '';
      if (fs.existsSync(standardsPath)) {
        standards = fs.readFileSync(standardsPath, 'utf-8');
      }

      // Convert and validate
      const docType = convertYamlToDocType(rawType, template, standards);

      // Ensure ID matches
      if (docType.id !== id) {
        console.warn(`Doc type ID mismatch: expected ${id}, got ${docType.id}`);
        docType.id = id;
      }

      return docType;
    } catch (error) {
      console.warn(`Failed to load doc type ${id}:`, error);
      return null;
    }
  }

  /**
   * Load custom types from config paths
   */
  private loadCustomTypes(configs: CustomDocTypeConfig[]): void {
    for (const config of configs) {
      try {
        if (config.path) {
          // Load from local directory
          const typePath = path.isAbsolute(config.path)
            ? config.path
            : path.join(this.baseDir, config.path);

          const docType = this.loadDocTypeFromDirectory(config.id, typePath);
          if (docType) {
            this.customTypes.set(docType.id, docType);
          }
        } else if (config.url) {
          // URL loading would be async - not supported in constructor
          // Users should use loadCustomTypeFromUrl() method instead
          console.warn(
            `URL-based doc type loading not supported in constructor. Use loadCustomTypeFromUrl() for ${config.id}`
          );
        }
      } catch (error) {
        console.warn(`Failed to load custom doc type ${config.id}:`, error);
      }
    }
  }

  /**
   * Load a custom doc type from a URL (async)
   * @param id - Type identifier
   * @param baseUrl - Base URL to the type directory (should contain type.yaml, template.md, standards.md)
   */
  async loadCustomTypeFromUrl(id: string, baseUrl: string): Promise<DocType | null> {
    try {
      // Fetch type.yaml
      const typeUrl = `${baseUrl}/type.yaml`;
      const typeResponse = await fetch(typeUrl);
      if (!typeResponse.ok) {
        console.warn(`Failed to fetch doc type: ${typeUrl}`);
        return null;
      }
      const typeContent = await typeResponse.text();
      const rawType = yaml.load(typeContent) as RawDocTypeYaml;

      // Fetch template.md
      let template = '';
      try {
        const templateUrl = `${baseUrl}/template.md`;
        const templateResponse = await fetch(templateUrl);
        if (templateResponse.ok) {
          template = await templateResponse.text();
        }
      } catch {
        // Template is optional
      }

      // Fetch standards.md
      let standards = '';
      try {
        const standardsUrl = `${baseUrl}/standards.md`;
        const standardsResponse = await fetch(standardsUrl);
        if (standardsResponse.ok) {
          standards = await standardsResponse.text();
        }
      } catch {
        // Standards is optional
      }

      const docType = convertYamlToDocType(rawType, template, standards);
      docType.id = id;
      this.customTypes.set(id, docType);
      return docType;
    } catch (error) {
      console.warn(`Failed to load doc type from URL ${baseUrl}:`, error);
      return null;
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

  /**
   * Get the manifest URL for core types
   */
  static getCoreManifestUrl(): string {
    return 'https://raw.githubusercontent.com/fractary/core/main/templates/docs/manifest.yaml';
  }

  /**
   * Get the base URL for a specific core type
   */
  static getCoreTypeUrl(typeId: string): string {
    return `https://raw.githubusercontent.com/fractary/core/main/templates/docs/${typeId}`;
  }
}
