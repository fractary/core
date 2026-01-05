/**
 * Tests for unified YAML configuration loader
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  loadYamlConfig,
  writeYamlConfig,
  substituteEnvVars,
  findProjectRoot,
  configExists,
  getConfigPath,
  getCoreDir,
  validateEnvVars,
  CoreYamlConfig,
} from './yaml-config';

describe('yaml-config', () => {
  let tempDir: string;
  let originalCwd: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Create temp directory for tests
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fractary-test-'));
    originalCwd = process.cwd();
    originalEnv = { ...process.env };

    // Clear test environment variables
    delete process.env.TEST_VAR;
    delete process.env.TEST_TOKEN;
    delete process.env.MISSING_VAR;
  });

  afterEach(() => {
    // Restore original state
    process.chdir(originalCwd);
    process.env = originalEnv;

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('substituteEnvVars', () => {
    it('should substitute environment variables', () => {
      process.env.TEST_VAR = 'test-value';

      const result = substituteEnvVars('token: ${TEST_VAR}', false);

      expect(result).toBe('token: test-value');
    });

    it('should substitute multiple environment variables', () => {
      process.env.TEST_VAR = 'value1';
      process.env.TEST_TOKEN = 'value2';

      const result = substituteEnvVars(
        'var: ${TEST_VAR}\ntoken: ${TEST_TOKEN}',
        false
      );

      expect(result).toBe('var: value1\ntoken: value2');
    });

    it('should use default value when variable not set', () => {
      const result = substituteEnvVars('token: ${MISSING_VAR:-default}', false);

      expect(result).toBe('token: default');
    });

    it('should prefer env var over default', () => {
      process.env.TEST_VAR = 'actual';

      const result = substituteEnvVars('token: ${TEST_VAR:-default}', false);

      expect(result).toBe('token: actual');
    });

    it('should keep placeholder when variable not set and no default', () => {
      const result = substituteEnvVars('token: ${MISSING_VAR}', false);

      expect(result).toBe('token: ${MISSING_VAR}');
    });

    it('should warn about missing variables when warnMissing is true', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      substituteEnvVars('token: ${MISSING_VAR}', true);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('MISSING_VAR')
      );

      consoleSpy.mockRestore();
    });

    it('should not warn when warnMissing is false', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      substituteEnvVars('token: ${MISSING_VAR}', false);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle complex default values', () => {
      const result = substituteEnvVars(
        'url: ${API_URL:-https://api.example.com}',
        false
      );

      expect(result).toBe('url: https://api.example.com');
    });

    it('should handle empty string env var', () => {
      process.env.TEST_VAR = '';

      const result = substituteEnvVars('token: ${TEST_VAR}', false);

      expect(result).toBe('token: ');
    });

    it('should not substitute invalid patterns', () => {
      const result = substituteEnvVars('token: $TEST_VAR', false);

      expect(result).toBe('token: $TEST_VAR');
    });

    it('should not substitute lowercase variables', () => {
      process.env.test_var = 'should-not-match';

      const result = substituteEnvVars('token: ${test_var}', false);

      expect(result).toBe('token: ${test_var}');
    });
  });

  describe('findProjectRoot', () => {
    it('should find project root with .fractary directory', () => {
      // Create .fractary directory
      const fractaryDir = path.join(tempDir, '.fractary');
      fs.mkdirSync(fractaryDir, { recursive: true });

      // Create subdirectory
      const subDir = path.join(tempDir, 'sub', 'dir');
      fs.mkdirSync(subDir, { recursive: true });

      const root = findProjectRoot(subDir);

      expect(root).toBe(tempDir);
    });

    it('should find project root with .git directory', () => {
      // Create .git directory
      const gitDir = path.join(tempDir, '.git');
      fs.mkdirSync(gitDir, { recursive: true });

      // Create subdirectory
      const subDir = path.join(tempDir, 'sub', 'dir');
      fs.mkdirSync(subDir, { recursive: true });

      const root = findProjectRoot(subDir);

      expect(root).toBe(tempDir);
    });

    it('should return start directory if no marker found', () => {
      const subDir = path.join(tempDir, 'sub', 'dir');
      fs.mkdirSync(subDir, { recursive: true });

      const root = findProjectRoot(subDir);

      expect(root).toBe(subDir);
    });

    it('should use current directory if no startDir provided', () => {
      const fractaryDir = path.join(tempDir, '.fractary');
      fs.mkdirSync(fractaryDir, { recursive: true });

      process.chdir(tempDir);

      const root = findProjectRoot();

      expect(root).toBe(tempDir);
    });

    it('should prefer .fractary over .git', () => {
      // Create both markers
      fs.mkdirSync(path.join(tempDir, '.fractary'), { recursive: true });
      fs.mkdirSync(path.join(tempDir, '.git'), { recursive: true });

      const subDir = path.join(tempDir, 'sub');
      fs.mkdirSync(subDir, { recursive: true });

      const root = findProjectRoot(subDir);

      expect(root).toBe(tempDir);
    });
  });

  describe('configExists', () => {
    it('should return true when config exists', () => {
      const coreDir = path.join(tempDir, '.fractary', 'core');
      fs.mkdirSync(coreDir, { recursive: true });
      fs.writeFileSync(path.join(coreDir, 'config.yaml'), 'version: "2.0"');

      const exists = configExists(tempDir);

      expect(exists).toBe(true);
    });

    it('should return false when config does not exist', () => {
      const exists = configExists(tempDir);

      expect(exists).toBe(false);
    });

    it('should auto-detect project root when not provided', () => {
      const coreDir = path.join(tempDir, '.fractary', 'core');
      fs.mkdirSync(coreDir, { recursive: true });
      fs.writeFileSync(path.join(coreDir, 'config.yaml'), 'version: "2.0"');

      process.chdir(tempDir);

      const exists = configExists();

      expect(exists).toBe(true);
    });
  });

  describe('getConfigPath', () => {
    it('should return config path for given project root', () => {
      const configPath = getConfigPath(tempDir);

      expect(configPath).toBe(path.join(tempDir, '.fractary', 'core', 'config.yaml'));
    });

    it('should auto-detect project root when not provided', () => {
      fs.mkdirSync(path.join(tempDir, '.fractary'), { recursive: true });
      process.chdir(tempDir);

      const configPath = getConfigPath();

      expect(configPath).toBe(path.join(tempDir, '.fractary', 'core', 'config.yaml'));
    });
  });

  describe('getCoreDir', () => {
    it('should return core directory path', () => {
      const coreDir = getCoreDir(tempDir);

      expect(coreDir).toBe(path.join(tempDir, '.fractary', 'core'));
    });

    it('should auto-detect project root when not provided', () => {
      fs.mkdirSync(path.join(tempDir, '.fractary'), { recursive: true });
      process.chdir(tempDir);

      const coreDir = getCoreDir();

      expect(coreDir).toBe(path.join(tempDir, '.fractary', 'core'));
    });
  });

  describe('loadYamlConfig', () => {
    it('should load valid YAML config', () => {
      const coreDir = path.join(tempDir, '.fractary', 'core');
      fs.mkdirSync(coreDir, { recursive: true });

      const configContent = `
version: "2.0"
work:
  active_handler: github
  handlers:
    github:
      owner: test
      repo: test
      token: test-token
`;

      fs.writeFileSync(path.join(coreDir, 'config.yaml'), configContent);

      const config = loadYamlConfig({ projectRoot: tempDir });

      expect(config).not.toBeNull();
      expect(config?.version).toBe('2.0');
      expect(config?.work?.active_handler).toBe('github');
    });

    it('should substitute environment variables', () => {
      process.env.TEST_TOKEN = 'secret-token';

      const coreDir = path.join(tempDir, '.fractary', 'core');
      fs.mkdirSync(coreDir, { recursive: true });

      const configContent = `
version: "2.0"
work:
  active_handler: github
  handlers:
    github:
      token: \${TEST_TOKEN}
`;

      fs.writeFileSync(path.join(coreDir, 'config.yaml'), configContent);

      const config = loadYamlConfig({ projectRoot: tempDir });

      expect(config?.work?.handlers?.github?.token).toBe('secret-token');
    });

    it('should return null when config does not exist', () => {
      const config = loadYamlConfig({ projectRoot: tempDir });

      expect(config).toBeNull();
    });

    it('should throw when config missing and throwIfMissing is true', () => {
      expect(() => {
        loadYamlConfig({ projectRoot: tempDir, throwIfMissing: true });
      }).toThrow('Configuration file not found');
    });

    it('should throw on invalid YAML', () => {
      const coreDir = path.join(tempDir, '.fractary', 'core');
      fs.mkdirSync(coreDir, { recursive: true });

      fs.writeFileSync(path.join(coreDir, 'config.yaml'), 'invalid: yaml: syntax:');

      expect(() => {
        loadYamlConfig({ projectRoot: tempDir });
      }).toThrow('Failed to load config');
    });

    it('should throw when config is not an object', () => {
      const coreDir = path.join(tempDir, '.fractary', 'core');
      fs.mkdirSync(coreDir, { recursive: true });

      fs.writeFileSync(path.join(coreDir, 'config.yaml'), 'just a string');

      expect(() => {
        loadYamlConfig({ projectRoot: tempDir });
      }).toThrow('Invalid configuration: must be a YAML object');
    });

    it('should warn when version field is missing', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const coreDir = path.join(tempDir, '.fractary', 'core');
      fs.mkdirSync(coreDir, { recursive: true });

      fs.writeFileSync(path.join(coreDir, 'config.yaml'), 'work: {}');

      loadYamlConfig({ projectRoot: tempDir });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing version field')
      );

      consoleSpy.mockRestore();
    });

    it('should auto-detect project root when not provided', () => {
      const coreDir = path.join(tempDir, '.fractary', 'core');
      fs.mkdirSync(coreDir, { recursive: true });
      fs.writeFileSync(path.join(coreDir, 'config.yaml'), 'version: "2.0"');

      process.chdir(tempDir);

      const config = loadYamlConfig();

      expect(config).not.toBeNull();
      expect(config?.version).toBe('2.0');
    });

    it('should handle complex config structure', () => {
      const coreDir = path.join(tempDir, '.fractary', 'core');
      fs.mkdirSync(coreDir, { recursive: true });

      const configContent = `
version: "2.0"
work:
  active_handler: github
  handlers:
    github:
      owner: myorg
      repo: myrepo
      classification:
        feature: [feature, enhancement]
        bug: [bug, fix]
  defaults:
    auto_assign: false
repo:
  active_handler: github
  handlers:
    github:
      token: test
  defaults:
    default_branch: main
logs:
  schema_version: "2.0"
  storage:
    local_path: /logs
file:
  schema_version: "1.0"
  active_handler: local
spec:
  schema_version: "1.0"
  storage:
    local_path: /specs
docs:
  schema_version: "1.1"
  doc_types:
    adr:
      enabled: true
`;

      fs.writeFileSync(path.join(coreDir, 'config.yaml'), configContent);

      const config = loadYamlConfig({ projectRoot: tempDir });

      expect(config).not.toBeNull();
      expect(config?.work?.active_handler).toBe('github');
      expect(config?.repo?.active_handler).toBe('github');
      expect(config?.logs?.schema_version).toBe('2.0');
      expect(config?.file?.schema_version).toBe('1.0');
      expect(config?.spec?.schema_version).toBe('1.0');
      expect(config?.docs?.schema_version).toBe('1.1');
    });
  });

  describe('writeYamlConfig', () => {
    it('should write config to file', () => {
      const config: CoreYamlConfig = {
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: {
            github: {
              owner: 'test',
              repo: 'test',
              token: '${GITHUB_TOKEN}',
            },
          },
        },
      };

      writeYamlConfig(config, tempDir);

      const configPath = path.join(tempDir, '.fractary', 'core', 'config.yaml');
      expect(fs.existsSync(configPath)).toBe(true);

      const content = fs.readFileSync(configPath, 'utf-8');
      expect(content).toContain('version: "2.0"');
      expect(content).toContain('active_handler: github');
    });

    it('should create directory if it does not exist', () => {
      const config: CoreYamlConfig = {
        version: '2.0',
      };

      writeYamlConfig(config, tempDir);

      const coreDir = path.join(tempDir, '.fractary', 'core');
      expect(fs.existsSync(coreDir)).toBe(true);
    });

    it('should preserve environment variable placeholders', () => {
      const config: CoreYamlConfig = {
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: {
            github: {
              token: '${GITHUB_TOKEN}',
            },
          },
        },
      };

      writeYamlConfig(config, tempDir);

      const configPath = path.join(tempDir, '.fractary', 'core', 'config.yaml');
      const content = fs.readFileSync(configPath, 'utf-8');

      expect(content).toContain('${GITHUB_TOKEN}');
    });

    it('should auto-detect project root when not provided', () => {
      fs.mkdirSync(path.join(tempDir, '.fractary'), { recursive: true });
      process.chdir(tempDir);

      const config: CoreYamlConfig = {
        version: '2.0',
      };

      writeYamlConfig(config);

      const configPath = path.join(tempDir, '.fractary', 'core', 'config.yaml');
      expect(fs.existsSync(configPath)).toBe(true);
    });
  });

  describe('validateEnvVars', () => {
    it('should return empty array when all vars are set', () => {
      process.env.TEST_TOKEN = 'value';

      const config: CoreYamlConfig = {
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: {
            github: {
              token: '${TEST_TOKEN}',
            },
          },
        },
      };

      const missing = validateEnvVars(config);

      expect(missing).toEqual([]);
    });

    it('should return missing variable names', () => {
      const config: CoreYamlConfig = {
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: {
            github: {
              token: '${MISSING_TOKEN}',
            },
          },
        },
      };

      const missing = validateEnvVars(config);

      expect(missing).toContain('MISSING_TOKEN');
    });

    it('should not report vars with defaults', () => {
      const config: CoreYamlConfig = {
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: {
            github: {
              api_url: '${API_URL:-https://api.github.com}',
            },
          },
        },
      };

      const missing = validateEnvVars(config);

      expect(missing).toEqual([]);
    });

    it('should return unique variable names', () => {
      const config: CoreYamlConfig = {
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: {
            github: {
              token: '${MISSING_TOKEN}',
            },
          },
        },
        repo: {
          active_handler: 'github',
          handlers: {
            github: {
              token: '${MISSING_TOKEN}',
            },
          },
        },
      };

      const missing = validateEnvVars(config);

      expect(missing).toEqual(['MISSING_TOKEN']);
    });

    it('should handle multiple missing variables', () => {
      const config: CoreYamlConfig = {
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: {
            github: {
              token: '${GITHUB_TOKEN}',
            },
          },
        },
        repo: {
          active_handler: 'gitlab',
          handlers: {
            gitlab: {
              token: '${GITLAB_TOKEN}',
            },
          },
        },
      };

      const missing = validateEnvVars(config);

      expect(missing).toContain('GITHUB_TOKEN');
      expect(missing).toContain('GITLAB_TOKEN');
    });
  });

  describe('Security Tests', () => {
    it('should prevent YAML code injection attacks', () => {
      const coreDir = path.join(tempDir, '.fractary', 'core');
      fs.mkdirSync(coreDir, { recursive: true });

      // Test that malicious YAML tags are rejected by yaml.safeLoad()
      // This YAML string contains a Python object tag that would execute code with yaml.load()
      // but should be safely rejected by yaml.safeLoad()
      const maliciousYaml = `
version: "2.0"
malicious: !!python/object/new:type
  args: ["z", !!python/tuple [], {"extend": !!python/name:exec }]
  listitems: "print('code executed')"
`;

      fs.writeFileSync(path.join(coreDir, 'config.yaml'), maliciousYaml);

      // Should fail to parse safely, not execute code
      expect(() => {
        loadYamlConfig({ projectRoot: tempDir });
      }).toThrow();
    });

    it('should safely handle path traversal attempts', () => {
      // Attempt path traversal in findProjectRoot
      const maliciousPath = path.join(tempDir, '..', '..', '..', 'etc');

      const result = findProjectRoot(maliciousPath);

      // Should handle gracefully without traversing outside intended directories
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should not execute shell commands in environment variable values', () => {
      // Set env var with shell command syntax
      process.env.MALICIOUS_VAR = '$(echo "malicious command")';

      const result = substituteEnvVars('cmd: ${MALICIOUS_VAR}', false);

      // Should substitute literally as string, not execute
      expect(result).toBe('cmd: $(echo "malicious command")');

      // Verify it's treated as plain string
      const coreDir = path.join(tempDir, '.fractary', 'core');
      fs.mkdirSync(coreDir, { recursive: true });

      const configContent = `
version: "2.0"
test: \${MALICIOUS_VAR}
`;

      fs.writeFileSync(path.join(coreDir, 'config.yaml'), configContent);

      const config = loadYamlConfig({ projectRoot: tempDir });

      // Value should be literal string, not executed
      expect(config?.test).toBe('$(echo "malicious command")');
    });

    it('should handle special characters in default values', () => {
      const result = substituteEnvVars(
        'value: ${MISSING:-https://example.com?param=1&other=2}',
        false
      );

      expect(result).toBe('value: https://example.com?param=1&other=2');
    });

    it('should not allow regex injection in variable names', () => {
      process.env['.*'] = 'should-not-match';

      const result = substituteEnvVars('value: ${SAFE_VAR}', false);

      // Should keep placeholder, not match regex pattern
      expect(result).toBe('value: ${SAFE_VAR}');
    });
  });
});
