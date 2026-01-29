/**
 * @fractary/core - Log Type Registry
 *
 * Manages log type definitions for structured logging.
 * Loads core types from YAML/Markdown files and custom types from config.
 *
 * Log types are stored as directories containing:
 * - type.yaml: Type definition (schema, frontmatter rules, file naming, retention)
 * - template.md: Mustache template for log generation
 * - standards.md: Standards and conventions for this type
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * Log type definition (camelCase for TypeScript)
 */
export interface LogTypeDefinition {
  /** Type identifier (e.g., 'session', 'audit', 'build') */
  id: string;

  /** Human-readable name */
  displayName: string;

  /** Description of this log type */
  description: string;

  /** Mustache template for log content */
  template: string;

  /** Default output path relative to logs directory */
  outputPath: string;

  /** File naming configuration */
  fileNaming: {
    pattern: string;
    dateFormat?: string;
    slugSource?: string;
    slugMaxLength?: number;
  };

  /** Frontmatter field configuration */
  frontmatter: {
    requiredFields: string[];
    optionalFields?: string[];
    defaults?: Record<string, unknown>;
  };

  /** Log structure requirements */
  structure?: {
    requiredSections?: string[];
    optionalSections?: string[];
    sectionOrder?: string[];
  };

  /** Status field configuration */
  status?: {
    allowedValues: string[];
    default: string;
  };

  /** Severity levels (for applicable log types) */
  severity?: {
    allowedValues: string[];
    default: string;
  };

  /** Retention policy */
  retention?: {
    defaultLocalDays: number | 'forever';
    defaultCloudDays: number | 'forever';
  };

  /** Documentation standards (markdown content) */
  standards?: string;
}

/**
 * Raw YAML structure (snake_case)
 */
interface RawLogTypeYaml {
  id: string;
  display_name: string;
  description: string;
  output_path: string;
  file_naming: {
    pattern: string;
    date_format?: string;
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
  severity?: {
    allowed_values: string[];
    default: string;
  };
  audit_type?: {
    allowed_values: string[];
    default: string;
  };
  change_type?: {
    allowed_values: string[];
    default: string;
  };
  category?: {
    allowed_values: string[];
    default: string;
  };
  test_type?: {
    allowed_values: string[];
    default: string;
  };
  phase?: {
    allowed_values: string[];
    default: string;
  };
  workflow_type?: {
    allowed_values: string[];
    default: string;
  };
  environment?: {
    allowed_values: string[];
    default: string;
  };
  retention?: {
    default_local_days: number | 'forever';
    default_cloud_days: number | 'forever';
  };
}

/**
 * Manifest entry for a log type
 */
interface ManifestLogType {
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
  log_types: ManifestLogType[];
}

/**
 * Configuration for custom log types
 */
export interface CustomLogTypeConfig {
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
export interface LogTypeRegistryConfig {
  /**
   * Custom log types to load from config (individual type configs)
   */
  customTypes?: CustomLogTypeConfig[];

  /**
   * Path to custom manifest.yaml file (loads all types from manifest)
   * This is typically set from logs.custom_templates_path in config.yaml
   */
  customManifestPath?: string;

  /**
   * Base directory for resolving relative paths
   */
  baseDir?: string;

  /**
   * Path to core templates/logs directory (defaults to bundled types)
   */
  coreTypesPath?: string;

  /**
   * Skip loading core types (useful for testing)
   */
  skipCoreTypes?: boolean;
}

/**
 * Convert raw YAML (snake_case) to LogTypeDefinition (camelCase)
 */
function convertYamlToLogType(
  raw: RawLogTypeYaml,
  template: string,
  standards: string
): LogTypeDefinition {
  return {
    id: raw.id,
    displayName: raw.display_name,
    description: raw.description,
    template,
    outputPath: raw.output_path,
    fileNaming: {
      pattern: raw.file_naming.pattern,
      dateFormat: raw.file_naming.date_format,
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
    severity: raw.severity
      ? {
          allowedValues: raw.severity.allowed_values,
          default: raw.severity.default,
        }
      : undefined,
    retention: raw.retention
      ? {
          defaultLocalDays: raw.retention.default_local_days,
          defaultCloudDays: raw.retention.default_cloud_days,
        }
      : undefined,
    standards,
  };
}

/**
 * Log Type Registry - Load and manage log type definitions
 */
export class LogTypeRegistry {
  private coreTypes: Map<string, LogTypeDefinition>;
  private customTypes: Map<string, LogTypeDefinition>;
  private baseDir: string;
  private coreTypesPath: string;

  constructor(config?: LogTypeRegistryConfig) {
    this.baseDir = config?.baseDir || process.cwd();
    this.coreTypes = new Map();
    this.customTypes = new Map();

    // Default to looking for templates/logs relative to package root
    // Only resolve path if we need to load core types
    if (config?.coreTypesPath) {
      this.coreTypesPath = config.coreTypesPath;
    } else if (!config?.skipCoreTypes) {
      this.coreTypesPath = this.findCoreTypesPath();
    } else {
      this.coreTypesPath = '';
    }

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
   * Find the core templates/logs directory
   * @throws Error if no valid templates directory is found
   */
  private findCoreTypesPath(): string {
    // Try common locations
    const candidates = [
      // Development: relative to SDK source
      path.resolve(__dirname, '../../../../templates/logs'),
      // Development: from repo root
      path.resolve(process.cwd(), 'templates/logs'),
      // Installed package: look in parent directories
      path.resolve(__dirname, '../../../../../templates/logs'),
      path.resolve(__dirname, '../../../../../../templates/logs'),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(path.join(candidate, 'manifest.yaml'))) {
        return candidate;
      }
    }

    // No valid path found - throw informative error
    const triedPaths = candidates.map((c) => `  - ${c}`).join('\n');
    throw new Error(
      `Could not find core log types manifest (manifest.yaml) in any of the expected locations:\n${triedPaths}\n` +
        'If you are using @fractary/core as a dependency, ensure the templates/logs directory is included in the package.'
    );
  }

  /**
   * Load all core log types from the templates/logs directory
   */
  private loadCoreTypes(): void {
    const manifestPath = path.join(this.coreTypesPath, 'manifest.yaml');

    if (!fs.existsSync(manifestPath)) {
      console.warn(`Core log types manifest not found: ${manifestPath}`);
      return;
    }

    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
      const manifest = yaml.load(manifestContent) as Manifest;

      for (const entry of manifest.log_types) {
        const logType = this.loadLogTypeFromDirectory(
          entry.id,
          path.join(this.coreTypesPath, entry.path.replace('./', ''))
        );
        if (logType) {
          this.coreTypes.set(logType.id, logType);
        }
      }
    } catch (error) {
      console.warn('Failed to load core log types:', error);
    }
  }

  /**
   * Load custom log types from a manifest file
   * This is used when logs.custom_templates_path is set in config.yaml
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

      for (const entry of manifest.log_types || []) {
        // Resolve type directory relative to manifest location
        const typeDirPath = path.join(manifestDir, entry.path.replace('./', ''));

        const logType = this.loadLogTypeFromDirectory(entry.id, typeDirPath);
        if (logType) {
          this.customTypes.set(logType.id, logType);
        }
      }
    } catch (error) {
      console.warn(`Failed to load custom log types from ${manifestPath}:`, error);
    }
  }

  /**
   * Load a log type from a directory
   */
  private loadLogTypeFromDirectory(id: string, dirPath: string): LogTypeDefinition | null {
    const typeYamlPath = path.join(dirPath, 'type.yaml');
    const templatePath = path.join(dirPath, 'template.md');
    const standardsPath = path.join(dirPath, 'standards.md');

    if (!fs.existsSync(typeYamlPath)) {
      console.warn(`Log type definition not found: ${typeYamlPath}`);
      return null;
    }

    try {
      // Read type.yaml
      const typeContent = fs.readFileSync(typeYamlPath, 'utf-8');
      const rawType = yaml.load(typeContent) as RawLogTypeYaml;

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
      const logType = convertYamlToLogType(rawType, template, standards);

      // Ensure ID matches
      if (logType.id !== id) {
        console.warn(`Log type ID mismatch: expected ${id}, got ${logType.id}`);
        logType.id = id;
      }

      return logType;
    } catch (error) {
      console.warn(`Failed to load log type ${id}:`, error);
      return null;
    }
  }

  /**
   * Load custom types from config paths
   */
  private loadCustomTypes(configs: CustomLogTypeConfig[]): void {
    for (const config of configs) {
      try {
        if (config.path) {
          // Load from local directory
          const typePath = path.isAbsolute(config.path)
            ? config.path
            : path.join(this.baseDir, config.path);

          const logType = this.loadLogTypeFromDirectory(config.id, typePath);
          if (logType) {
            this.customTypes.set(logType.id, logType);
          }
        } else if (config.url) {
          // URL loading would be async - not supported in constructor
          // Users should use loadCustomTypeFromUrl() method instead
          console.warn(
            `URL-based log type loading not supported in constructor. Use loadCustomTypeFromUrl() for ${config.id}`
          );
        }
      } catch (error) {
        console.warn(`Failed to load custom log type ${config.id}:`, error);
      }
    }
  }

  /**
   * Load a custom log type from a URL (async)
   * @param id - Type identifier
   * @param baseUrl - Base URL to the type directory (should contain type.yaml, template.md, standards.md)
   */
  async loadCustomTypeFromUrl(id: string, baseUrl: string): Promise<LogTypeDefinition | null> {
    try {
      // Fetch type.yaml
      const typeUrl = `${baseUrl}/type.yaml`;
      const typeResponse = await fetch(typeUrl);
      if (!typeResponse.ok) {
        console.warn(`Failed to fetch log type: ${typeUrl}`);
        return null;
      }
      const typeContent = await typeResponse.text();
      const rawType = yaml.load(typeContent) as RawLogTypeYaml;

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

      const logType = convertYamlToLogType(rawType, template, standards);
      logType.id = id;
      this.customTypes.set(id, logType);
      return logType;
    } catch (error) {
      console.warn(`Failed to load log type from URL ${baseUrl}:`, error);
      return null;
    }
  }

  /**
   * Get all available log types (core + custom)
   */
  getAllTypes(): LogTypeDefinition[] {
    const types: LogTypeDefinition[] = [];

    // Add core types
    for (const logType of this.coreTypes.values()) {
      types.push(logType);
    }

    // Add custom types (may override core types)
    for (const logType of this.customTypes.values()) {
      const existingIndex = types.findIndex((t) => t.id === logType.id);
      if (existingIndex >= 0) {
        types[existingIndex] = logType;
      } else {
        types.push(logType);
      }
    }

    return types.sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Get a log type by ID
   */
  getType(id: string): LogTypeDefinition | null {
    // Custom types take precedence
    if (this.customTypes.has(id)) {
      return this.customTypes.get(id)!;
    }

    return this.coreTypes.get(id) || null;
  }

  /**
   * Check if a log type exists
   */
  hasType(id: string): boolean {
    return this.coreTypes.has(id) || this.customTypes.has(id);
  }

  /**
   * Get only core types
   */
  getCoreTypes(): LogTypeDefinition[] {
    return Array.from(this.coreTypes.values()).sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Get only custom types
   */
  getCustomTypes(): LogTypeDefinition[] {
    return Array.from(this.customTypes.values()).sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Register a custom type programmatically
   */
  registerType(logType: LogTypeDefinition): void {
    this.customTypes.set(logType.id, logType);
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
    return 'https://raw.githubusercontent.com/fractary/core/main/templates/logs/manifest.yaml';
  }

  /**
   * Get the base URL for a specific core type
   */
  static getCoreTypeUrl(typeId: string): string {
    return `https://raw.githubusercontent.com/fractary/core/main/templates/logs/${typeId}`;
  }

  /**
   * Get type IDs as array (useful for validation)
   */
  getTypeIds(): string[] {
    const ids = new Set<string>();
    for (const id of this.coreTypes.keys()) {
      ids.add(id);
    }
    for (const id of this.customTypes.keys()) {
      ids.add(id);
    }
    return Array.from(ids).sort();
  }
}
