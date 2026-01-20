/**
 * @fractary/core - Configuration Module
 *
 * Unified configuration loading with authentication support.
 */

// Re-export from loader
export {
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
  findProjectRoot,
  configExists,
  getConfigPath,
  getCoreDir,
  substituteEnvVars,
  validateEnvVars,
  type CoreYamlConfig,
  type ConfigLoadOptions,
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
