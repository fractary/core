/**
 * @fractary/core - Configuration Module
 *
 * Unified configuration loading with authentication support.
 */

// Re-export from loader
export {
  loadEnv,
  isEnvLoaded,
  getCurrentEnv,
  switchEnv,
  clearEnv,
  loadConfig,
  loadConfigSync,
  type LoadedConfig,
  type LoadConfigOptions,
  type ExtractedGitHubConfig,
} from './loader';

// Re-export common yaml-config utilities
// Note: YAML config types are prefixed with 'Yaml' to avoid conflicts
// with manager runtime types exported from ./work, ./repo, etc.
export {
  loadYamlConfig,
  writeYamlConfig,
  injectDocumentationComments,
  findProjectRoot,
  configExists,
  getConfigPath,
  getCoreDir,
  substituteEnvVars,
  validateEnvVars,
  // Documentation URL constants for config sections
  PLUGIN_DOC_URLS,
  CONFIG_GUIDE_URL,
  type CoreYamlConfig,
  type ConfigLoadOptions,
  type WriteYamlConfigOptions,
  // Rename to avoid conflicts with runtime types from common/types.ts
  type WorkConfig as YamlWorkConfig,
  type RepoConfig as YamlRepoConfig,
  type LogsConfig as YamlLogsConfig,
  type FileConfig as YamlFileConfig,
  type SpecConfig as YamlSpecConfig,
  type DocsConfig as YamlDocsConfig,
  type CodexConfig as YamlCodexConfig,
  type RepoDefaults as YamlRepoDefaults,
  type PRDefaults as YamlPRDefaults,
  type PRMergeDefaults as YamlPRMergeDefaults,
  type FileSource as YamlFileSource,
} from '../common/yaml-config';

// Re-export default config generators
export {
  getDefaultConfig,
  getMinimalConfig,
  type DefaultConfigOptions,
} from './defaults';

// Re-export validation schemas and utilities
export {
  validateConfig,
  CoreYamlConfigSchema,
  WorkConfigSchema,
  RepoConfigSchema,
  LogsConfigSchema,
  FileConfigSchema,
  SpecConfigSchema,
  DocsConfigSchema,
  CodexConfigSchema,
  type ValidationResult,
  type ValidatedCoreYamlConfig,
} from './schema';
