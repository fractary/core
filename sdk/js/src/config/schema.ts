/**
 * @fractary/core - Configuration Validation Schemas
 *
 * Zod schemas for validating Fractary Core configuration.
 * Provides runtime type checking and detailed error messages.
 */

import { z } from 'zod';

/**
 * PR merge defaults schema
 */
export const PRMergeDefaultsSchema = z.object({
  strategy: z.enum(['squash', 'merge', 'rebase']).optional(),
  delete_branch: z.boolean().optional(),
}).strict().optional();

/**
 * PR defaults schema
 */
export const PRDefaultsSchema = z.object({
  template: z.string().optional(),
  require_work_id: z.boolean().optional(),
  auto_link_issues: z.boolean().optional(),
  ci_polling: z.object({
    enabled: z.boolean().optional(),
    interval_seconds: z.number().positive().optional(),
    timeout_seconds: z.number().positive().optional(),
    initial_delay_seconds: z.number().nonnegative().optional(),
  }).optional(),
  merge: PRMergeDefaultsSchema,
}).optional();

/**
 * Repository defaults schema
 */
export const RepoDefaultsSchema = z.object({
  default_branch: z.string().optional(),
  protected_branches: z.array(z.string()).optional(),
  branch_naming: z.record(z.any()).optional(),
  commit_format: z.string().optional(),
  require_signed_commits: z.boolean().optional(),
  merge_strategy: z.string().optional(),
  auto_delete_merged_branches: z.boolean().optional(),
  remote: z.record(z.any()).optional(),
  push_sync_strategy: z.string().optional(),
  pull_sync_strategy: z.string().optional(),
  pr: PRDefaultsSchema,
}).optional();

/**
 * Work configuration schema
 */
export const WorkConfigSchema = z.object({
  active_handler: z.string().min(1, 'active_handler is required'),
  handlers: z.record(z.any()).refine(
    (handlers) => Object.keys(handlers).length > 0,
    'At least one handler must be configured'
  ),
  defaults: z.record(z.any()).optional(),
  hooks: z.record(z.any()).optional(),
  advanced: z.record(z.any()).optional(),
});

/**
 * Repository configuration schema
 */
export const RepoConfigSchema = z.object({
  active_handler: z.string().min(1, 'active_handler is required'),
  handlers: z.record(z.any()).refine(
    (handlers) => Object.keys(handlers).length > 0,
    'At least one handler must be configured'
  ),
  defaults: RepoDefaultsSchema,
  faber_integration: z.record(z.any()).optional(),
  hooks: z.record(z.any()).optional(),
  platform_specific: z.record(z.any()).optional(),
});

/**
 * Logs configuration schema
 */
export const LogsConfigSchema = z.object({
  schema_version: z.string(),
  custom_templates_path: z.string().optional(),
  storage: z.record(z.any()).optional(),
  retention: z.record(z.any()).optional(),
  session_logging: z.record(z.any()).optional(),
  auto_backup: z.record(z.any()).optional(),
  summarization: z.record(z.any()).optional(),
  archive: z.record(z.any()).optional(),
  search: z.record(z.any()).optional(),
  integration: z.record(z.any()).optional(),
  docs_integration: z.record(z.any()).optional(),
});

/**
 * File source schema
 */
export const FileSourceSchema = z.object({
  type: z.string().min(1),
  bucket: z.string().optional(),
  prefix: z.string().optional(),
  region: z.string().optional(),
  project_id: z.string().optional(),
  local: z.object({
    base_path: z.string().min(1),
  }),
  push: z.object({
    compress: z.boolean().optional(),
    keep_local: z.boolean().optional(),
  }).optional(),
  auth: z.record(z.any()).optional(),
});

/**
 * File configuration schema
 */
export const FileConfigSchema = z.object({
  schema_version: z.string(),
  sources: z.record(FileSourceSchema).optional(),
  global_settings: z.record(z.any()).optional(),
  // Legacy v1.0 fields
  active_handler: z.string().optional(),
  handlers: z.record(z.any()).optional(),
});

/**
 * Specification configuration schema
 */
export const SpecConfigSchema = z.object({
  schema_version: z.string(),
  storage: z.record(z.any()).optional(),
  naming: z.record(z.any()).optional(),
  archive: z.record(z.any()).optional(),
  integration: z.record(z.any()).optional(),
  templates: z.record(z.any()).optional(),
});

/**
 * Documentation configuration schema
 */
export const DocsConfigSchema = z.object({
  schema_version: z.string(),
  custom_templates_path: z.string().optional(),
  hooks: z.record(z.any()).optional(),
  doc_types: z.record(z.any()).optional(),
  output_paths: z.record(z.any()).optional(),
  templates: z.record(z.any()).optional(),
  frontmatter: z.record(z.any()).optional(),
  validation: z.record(z.any()).optional(),
  linking: z.record(z.any()).optional(),
});

/**
 * Codex configuration schema
 */
export const CodexConfigSchema = z.object({
  schema_version: z.string(),
  organization: z.string().min(1),
  project: z.string().min(1),
  dependencies: z.record(z.any()).optional(),
});

/**
 * Complete CoreYamlConfig schema
 */
export const CoreYamlConfigSchema = z.object({
  version: z.string().refine(
    (v) => v === '2.0',
    { message: 'Configuration version must be "2.0"' }
  ),
  work: WorkConfigSchema.optional(),
  repo: RepoConfigSchema.optional(),
  logs: LogsConfigSchema.optional(),
  file: FileConfigSchema.optional(),
  spec: SpecConfigSchema.optional(),
  docs: DocsConfigSchema.optional(),
  codex: CodexConfigSchema.optional(),
});

/**
 * Validation result type
 */
export interface ValidationResult {
  /** Whether the configuration is valid */
  valid: boolean;
  /** Array of error messages (empty if valid) */
  errors: string[];
  /** Array of warning messages */
  warnings: string[];
  /** Parsed configuration (only present if valid) */
  config?: z.infer<typeof CoreYamlConfigSchema>;
}

/**
 * Validate a configuration object against the schema
 *
 * @param config Configuration object to validate
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```typescript
 * const result = validateConfig(loadedConfig);
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function validateConfig(config: unknown): ValidationResult {
  const warnings: string[] = [];

  // First check basic structure
  if (config === null || config === undefined) {
    return {
      valid: false,
      errors: ['Configuration is null or undefined'],
      warnings: [],
    };
  }

  if (typeof config !== 'object') {
    return {
      valid: false,
      errors: ['Configuration must be an object'],
      warnings: [],
    };
  }

  const configObj = config as Record<string, unknown>;

  // Check for at least one plugin section
  const pluginSections = ['work', 'repo', 'logs', 'file', 'spec', 'docs'];
  const presentSections = pluginSections.filter((section) => configObj[section]);
  if (presentSections.length === 0) {
    warnings.push('No plugin sections found in configuration');
  }

  // Validate active handlers reference existing handlers
  if (configObj.work && typeof configObj.work === 'object') {
    const work = configObj.work as Record<string, unknown>;
    const activeHandler = work.active_handler as string;
    const handlers = work.handlers as Record<string, unknown> | undefined;
    if (activeHandler && handlers && !handlers[activeHandler]) {
      warnings.push(`Work handler '${activeHandler}' not found in work.handlers`);
    }
  }

  if (configObj.repo && typeof configObj.repo === 'object') {
    const repo = configObj.repo as Record<string, unknown>;
    const activeHandler = repo.active_handler as string;
    const handlers = repo.handlers as Record<string, unknown> | undefined;
    if (activeHandler && handlers && !handlers[activeHandler]) {
      warnings.push(`Repo handler '${activeHandler}' not found in repo.handlers`);
    }
  }

  // Run Zod validation
  const result = CoreYamlConfigSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.errors.map((err) => {
      const path = err.path.join('.');
      return path ? `${path}: ${err.message}` : err.message;
    });

    return {
      valid: false,
      errors,
      warnings,
    };
  }

  return {
    valid: true,
    errors: [],
    warnings,
    config: result.data,
  };
}

/**
 * Type alias for inferred CoreYamlConfig from schema
 */
export type ValidatedCoreYamlConfig = z.infer<typeof CoreYamlConfigSchema>;
