/**
 * Tests for config command
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Command } from 'commander';
import { registerConfigCommand } from './config';

// Mock modules
jest.mock('../utils/config.js');
jest.mock('@fractary/core/common/yaml-config');
jest.mock('chalk', () => ({
  default: {
    blue: (str: string) => str,
    red: (str: string) => str,
    green: (str: string) => str,
    yellow: (str: string) => str,
    cyan: (str: string) => str,
    gray: (str: string) => str,
    bold: (str: string) => str,
  },
}));

import * as configUtils from '../utils/config.js';
import * as yamlConfig from '@fractary/core/common/yaml-config';

describe('config command', () => {
  let tempDir: string;
  let originalCwd: string;
  let originalExit: typeof process.exit;
  let originalLog: typeof console.log;
  let originalError: typeof console.error;
  let exitCode: number | undefined;
  let consoleOutput: string[];

  beforeEach(() => {
    // Create temp directory
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fractary-test-'));
    originalCwd = process.cwd();

    // Mock process.exit
    exitCode = undefined;
    originalExit = process.exit;
    process.exit = ((code?: number) => {
      exitCode = code || 0;
      throw new Error(`process.exit(${code})`);
    }) as any;

    // Mock console
    consoleOutput = [];
    originalLog = console.log;
    originalError = console.error;
    console.log = (...args: any[]) => {
      consoleOutput.push(args.join(' '));
    };
    console.error = (...args: any[]) => {
      consoleOutput.push('ERROR: ' + args.join(' '));
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original state
    process.chdir(originalCwd);
    process.exit = originalExit;
    console.log = originalLog;
    console.error = originalError;

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('registerConfigCommand', () => {
    it('should register config command with subcommands', () => {
      const program = new Command();
      registerConfigCommand(program);

      const configCmd = program.commands.find((cmd) => cmd.name() === 'config');
      expect(configCmd).toBeDefined();
      expect(configCmd?.commands.length).toBe(2);

      const validateCmd = configCmd?.commands.find((cmd) => cmd.name() === 'validate');
      expect(validateCmd).toBeDefined();

      const showCmd = configCmd?.commands.find((cmd) => cmd.name() === 'show');
      expect(showCmd).toBeDefined();
    });
  });

  describe('validate command', () => {
    beforeEach(() => {
      (yamlConfig.findProjectRoot as jest.Mock).mockReturnValue(tempDir);
      (configUtils.getConfigPath as jest.Mock).mockReturnValue(
        path.join(tempDir, '.fractary', 'core', 'config.yaml')
      );
    });

    it('should fail when config file does not exist', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'validate']);
      } catch (error) {
        // Expected to throw due to process.exit mock
      }

      expect(exitCode).toBe(1);
      expect(consoleOutput.some((line) => line.includes('not found'))).toBe(true);
    });

    it('should fail on invalid YAML format', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid YAML');
      });

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'validate']);
      } catch (error) {
        // Expected to throw
      }

      expect(exitCode).toBe(1);
      expect(consoleOutput.some((line) => line.includes('Invalid YAML format'))).toBe(true);
    });

    it('should fail when config is null', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue(null);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'validate']);
      } catch (error) {
        // Expected to throw
      }

      expect(exitCode).toBe(1);
      expect(consoleOutput.some((line) => line.includes('Failed to load'))).toBe(true);
    });

    it('should pass validation for valid config', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: {
            github: {
              owner: 'test',
              repo: 'test',
              token: 'test-token',
            },
          },
        },
      });
      (yamlConfig.validateEnvVars as jest.Mock).mockReturnValue([]);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'validate']);
      } catch (error) {
        // May throw but should have exit code 0
      }

      expect(exitCode).toBeUndefined();
      expect(consoleOutput.some((line) => line.includes('Configuration is valid'))).toBe(true);
    });

    it('should error on missing version field', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        work: {
          active_handler: 'github',
          handlers: { github: {} },
        },
      });
      (yamlConfig.validateEnvVars as jest.Mock).mockReturnValue([]);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'validate']);
      } catch (error) {
        // Expected to throw
      }

      expect(exitCode).toBe(1);
      expect(consoleOutput.some((line) => line.includes('Missing required field: version'))).toBe(
        true
      );
    });

    it('should warn on unexpected version', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '1.0',
        work: {
          active_handler: 'github',
          handlers: { github: {} },
        },
      });
      (yamlConfig.validateEnvVars as jest.Mock).mockReturnValue([]);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'validate']);
      } catch (error) {
        // May throw but with exit code 0
      }

      expect(consoleOutput.some((line) => line.includes('Unexpected version'))).toBe(true);
    });

    it('should warn when no plugin sections found', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
      });
      (yamlConfig.validateEnvVars as jest.Mock).mockReturnValue([]);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'validate']);
      } catch (error) {
        // May throw
      }

      expect(consoleOutput.some((line) => line.includes('No plugin sections found'))).toBe(true);
    });

    it('should error on missing work.active_handler', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
        work: {
          handlers: { github: {} },
        },
      });
      (yamlConfig.validateEnvVars as jest.Mock).mockReturnValue([]);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'validate']);
      } catch (error) {
        // Expected to throw
      }

      expect(exitCode).toBe(1);
      expect(
        consoleOutput.some((line) => line.includes('Missing required field: work.active_handler'))
      ).toBe(true);
    });

    it('should error on missing work.handlers', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
        work: {
          active_handler: 'github',
        },
      });
      (yamlConfig.validateEnvVars as jest.Mock).mockReturnValue([]);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'validate']);
      } catch (error) {
        // Expected to throw
      }

      expect(exitCode).toBe(1);
      expect(
        consoleOutput.some((line) => line.includes('Missing required field: work.handlers'))
      ).toBe(true);
    });

    it('should error when active handler not in handlers', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: {
            gitlab: {},
          },
        },
      });
      (yamlConfig.validateEnvVars as jest.Mock).mockReturnValue([]);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'validate']);
      } catch (error) {
        // Expected to throw
      }

      expect(exitCode).toBe(1);
      expect(
        consoleOutput.some((line) =>
          line.includes("Configuration for work handler 'github' not found")
        )
      ).toBe(true);
    });

    it('should validate repo section handlers', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
        repo: {
          active_handler: 'github',
          handlers: {
            gitlab: {},
          },
        },
      });
      (yamlConfig.validateEnvVars as jest.Mock).mockReturnValue([]);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'validate']);
      } catch (error) {
        // Expected to throw
      }

      expect(exitCode).toBe(1);
      expect(
        consoleOutput.some((line) =>
          line.includes("Configuration for repo handler 'github' not found")
        )
      ).toBe(true);
    });

    it('should validate file section handlers', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
        file: {
          active_handler: 'local',
          handlers: {
            s3: {},
          },
        },
      });
      (yamlConfig.validateEnvVars as jest.Mock).mockReturnValue([]);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'validate']);
      } catch (error) {
        // Expected to throw
      }

      expect(exitCode).toBe(1);
      expect(
        consoleOutput.some((line) =>
          line.includes("Configuration for file handler 'local' not found")
        )
      ).toBe(true);
    });

    it('should warn about missing environment variables', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: { github: {} },
        },
      });
      (yamlConfig.validateEnvVars as jest.Mock).mockReturnValue([
        'GITHUB_TOKEN',
        'GITLAB_TOKEN',
      ]);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'validate']);
      } catch (error) {
        // May throw
      }

      expect(
        consoleOutput.some((line) =>
          line.includes('Missing environment variables: GITHUB_TOKEN, GITLAB_TOKEN')
        )
      ).toBe(true);
    });

    it('should show detailed output with verbose flag', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: {
            github: {
              token: 'secret',
            },
          },
        },
      });
      (yamlConfig.validateEnvVars as jest.Mock).mockReturnValue([]);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'validate', '--verbose']);
      } catch (error) {
        // May throw
      }

      expect(consoleOutput.some((line) => line.includes('Raw configuration'))).toBe(true);
    });
  });

  describe('show command', () => {
    beforeEach(() => {
      (yamlConfig.findProjectRoot as jest.Mock).mockReturnValue(tempDir);
      (configUtils.getConfigPath as jest.Mock).mockReturnValue(
        path.join(tempDir, '.fractary', 'core', 'config.yaml')
      );
    });

    it('should fail when config file does not exist', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'show']);
      } catch (error) {
        // Expected to throw
      }

      expect(exitCode).toBe(1);
      expect(consoleOutput.some((line) => line.includes('not found'))).toBe(true);
    });

    it('should fail when config is null', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue(null);

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'show']);
      } catch (error) {
        // Expected to throw
      }

      expect(exitCode).toBe(1);
      expect(consoleOutput.some((line) => line.includes('Failed to load'))).toBe(true);
    });

    it('should display config with redacted sensitive values', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: {
            github: {
              owner: 'myorg',
              repo: 'myrepo',
              token: 'secret-token-value',
              api_key: 'secret-key-value',
            },
          },
        },
      });

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'show']);
      } catch (error) {
        // May throw
      }

      const outputStr = consoleOutput.join('\n');
      expect(outputStr).toContain('myorg');
      expect(outputStr).toContain('myrepo');
      expect(outputStr).toContain('********'); // Redacted token
      expect(outputStr).not.toContain('secret-token-value');
      expect(outputStr).not.toContain('secret-key-value');
    });

    it('should preserve environment variable placeholders', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: {
            github: {
              token: '${GITHUB_TOKEN}',
            },
          },
        },
      });

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'show']);
      } catch (error) {
        // May throw
      }

      const outputStr = consoleOutput.join('\n');
      expect(outputStr).toContain('${GITHUB_TOKEN}');
    });

    it('should redact multiple sensitive fields', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: {
            github: {
              token: 'secret1',
              api_key: 'secret2',
              secret: 'secret3',
              password: 'secret4',
            },
          },
        },
      });

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'show']);
      } catch (error) {
        // May throw
      }

      const outputStr = consoleOutput.join('\n');
      expect(outputStr).not.toContain('secret1');
      expect(outputStr).not.toContain('secret2');
      expect(outputStr).not.toContain('secret3');
      expect(outputStr).not.toContain('secret4');
      expect((outputStr.match(/\*{8}/g) || []).length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('redactConfig helper', () => {
    // Note: This is testing the internal redactConfig function indirectly through show command

    it('should redact token fields', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
        test: {
          access_token: 'secret',
          refresh_token: 'secret',
          github_token: 'secret',
        },
      });
      (yamlConfig.findProjectRoot as jest.Mock).mockReturnValue(tempDir);
      (configUtils.getConfigPath as jest.Mock).mockReturnValue(
        path.join(tempDir, '.fractary', 'core', 'config.yaml')
      );

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'show']);
      } catch (error) {
        // May throw
      }

      const outputStr = consoleOutput.join('\n');
      expect(outputStr).not.toContain('secret');
      expect((outputStr.match(/\*{8}/g) || []).length).toBeGreaterThanOrEqual(3);
    });

    it('should redact key fields', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
        test: {
          api_key: 'secret',
          access_key: 'secret',
          private_key: 'secret',
        },
      });
      (yamlConfig.findProjectRoot as jest.Mock).mockReturnValue(tempDir);
      (configUtils.getConfigPath as jest.Mock).mockReturnValue(
        path.join(tempDir, '.fractary', 'core', 'config.yaml')
      );

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'show']);
      } catch (error) {
        // May throw
      }

      const outputStr = consoleOutput.join('\n');
      expect(outputStr).not.toContain('secret');
    });

    it('should handle nested objects', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      (configUtils.loadConfig as jest.Mock).mockReturnValue({
        version: '2.0',
        nested: {
          level1: {
            level2: {
              token: 'secret',
            },
          },
        },
      });
      (yamlConfig.findProjectRoot as jest.Mock).mockReturnValue(tempDir);
      (configUtils.getConfigPath as jest.Mock).mockReturnValue(
        path.join(tempDir, '.fractary', 'core', 'config.yaml')
      );

      const program = new Command();
      registerConfigCommand(program);

      try {
        await program.parseAsync(['node', 'test', 'config', 'show']);
      } catch (error) {
        // May throw
      }

      const outputStr = consoleOutput.join('\n');
      expect(outputStr).not.toContain('secret');
    });
  });
});
