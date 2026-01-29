/**
 * Unit tests for config loader
 */

import { loadEnv, isEnvLoaded, getCurrentEnv, switchEnv, clearEnv } from '../loader';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));
import * as dotenv from 'dotenv';
const mockedDotenv = dotenv as jest.Mocked<typeof dotenv>;

describe('loadEnv', () => {
  const originalCwd = process.cwd;
  const originalEnv = process.env.FRACTARY_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.FRACTARY_ENV;
  });

  afterAll(() => {
    process.cwd = originalCwd;
    if (originalEnv !== undefined) {
      process.env.FRACTARY_ENV = originalEnv;
    } else {
      delete process.env.FRACTARY_ENV;
    }
  });

  describe('when .env exists in cwd', () => {
    it('should load .env from current working directory', () => {
      mockedFs.existsSync.mockImplementation((p) => {
        return p === path.join(process.cwd(), '.env');
      });

      const result = loadEnv({ force: true });

      expect(result).toBe(true);
      expect(mockedDotenv.config).toHaveBeenCalledWith({
        path: path.join(process.cwd(), '.env'),
        override: true,
      });
    });

    it('should not load again if already loaded', () => {
      mockedFs.existsSync.mockReturnValue(true);

      loadEnv({ force: true });
      const callCount = mockedDotenv.config.mock.calls.length;

      loadEnv(); // Second call without force

      // Should not call dotenv.config again
      expect(mockedDotenv.config).toHaveBeenCalledTimes(callCount);
    });

    it('should reload with force option', () => {
      mockedFs.existsSync.mockImplementation((p) => {
        // Only .env exists (no .env.local)
        return String(p).endsWith('.env') && !String(p).endsWith('.local');
      });

      loadEnv({ force: true });
      const callCount = mockedDotenv.config.mock.calls.length;

      loadEnv({ force: true }); // Force reload

      // Each reload loads .env (and would load .env.local if it existed)
      expect(mockedDotenv.config.mock.calls.length).toBeGreaterThan(callCount);
    });
  });

  describe('when .env does not exist', () => {
    it('should return false when no .env file found', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = loadEnv({ force: true });

      expect(result).toBe(false);
    });

    it('should try project root if cwd .env does not exist', () => {
      // First call (cwd .env) returns false, second call (project root) returns true
      let callCount = 0;
      mockedFs.existsSync.mockImplementation(() => {
        callCount++;
        return callCount > 1; // Project root .env exists
      });

      const result = loadEnv({ force: true });

      expect(result).toBe(true);
    });
  });

  describe('with custom cwd', () => {
    it('should use provided cwd', () => {
      const customCwd = '/custom/path';
      mockedFs.existsSync.mockImplementation((p) => {
        return p === path.join(customCwd, '.env');
      });

      const result = loadEnv({ cwd: customCwd, force: true });

      expect(result).toBe(true);
      expect(mockedDotenv.config).toHaveBeenCalledWith({
        path: path.join(customCwd, '.env'),
        override: true,
      });
    });
  });

  describe('multi-environment support (FRACTARY_ENV)', () => {
    it('should load .env.{FRACTARY_ENV} when FRACTARY_ENV is set', () => {
      process.env.FRACTARY_ENV = 'prod';
      const projectRoot = process.cwd();

      mockedFs.existsSync.mockImplementation((p) => {
        const pathStr = String(p);
        // Both .env and .env.prod exist
        return (
          pathStr === path.join(projectRoot, '.env') ||
          pathStr === path.join(projectRoot, '.env.prod')
        );
      });

      const result = loadEnv({ force: true });

      expect(result).toBe(true);
      // Should load .env first, then .env.prod
      expect(mockedDotenv.config).toHaveBeenCalledWith({
        path: path.join(projectRoot, '.env'),
        override: true,
      });
      expect(mockedDotenv.config).toHaveBeenCalledWith({
        path: path.join(projectRoot, '.env.prod'),
        override: true,
      });
    });

    it('should load .env.local last for local overrides', () => {
      const projectRoot = process.cwd();

      mockedFs.existsSync.mockImplementation((p) => {
        const pathStr = String(p);
        // Both .env and .env.local exist
        return (
          pathStr === path.join(projectRoot, '.env') ||
          pathStr === path.join(projectRoot, '.env.local')
        );
      });

      const result = loadEnv({ force: true });

      expect(result).toBe(true);

      // Get all call arguments as strings
      const calls = mockedDotenv.config.mock.calls.map((c) => String(c[0]?.path || ''));

      // .env should be loaded before .env.local
      const envIndex = calls.findIndex((p) => p.endsWith('.env') && !p.includes('.local'));
      const localIndex = calls.findIndex((p) => p.endsWith('.env.local'));

      expect(envIndex).toBeGreaterThanOrEqual(0);
      expect(localIndex).toBeGreaterThan(envIndex);
    });

    it('should track current environment via getCurrentEnv', () => {
      process.env.FRACTARY_ENV = 'staging';
      mockedFs.existsSync.mockReturnValue(true);

      loadEnv({ force: true });

      expect(getCurrentEnv()).toBe('staging');
    });

    it('should return undefined from getCurrentEnv when FRACTARY_ENV not set', () => {
      delete process.env.FRACTARY_ENV;
      mockedFs.existsSync.mockReturnValue(true);

      loadEnv({ force: true });

      expect(getCurrentEnv()).toBeUndefined();
    });
  });
});

describe('isEnvLoaded', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true after successful loadEnv', () => {
    mockedFs.existsSync.mockReturnValue(true);

    loadEnv({ force: true });

    expect(isEnvLoaded()).toBe(true);
  });
});

describe('switchEnv', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.FRACTARY_ENV;
  });

  it('should set FRACTARY_ENV and reload environment', () => {
    const projectRoot = process.cwd();

    mockedFs.existsSync.mockImplementation((p) => {
      const pathStr = String(p);
      return (
        pathStr === path.join(projectRoot, '.env') ||
        pathStr === path.join(projectRoot, '.env.test')
      );
    });

    const result = switchEnv('test');

    expect(result).toBe(true);
    expect(process.env.FRACTARY_ENV).toBe('test');
    expect(getCurrentEnv()).toBe('test');
    expect(mockedDotenv.config).toHaveBeenCalledWith({
      path: path.join(projectRoot, '.env.test'),
      override: true,
    });
  });

  it('should allow switching between environments (FABR workflow)', () => {
    const projectRoot = process.cwd();

    mockedFs.existsSync.mockImplementation((p) => {
      const pathStr = String(p);
      // Simulate having .env, .env.test, and .env.prod
      return (
        pathStr === path.join(projectRoot, '.env') ||
        pathStr === path.join(projectRoot, '.env.test') ||
        pathStr === path.join(projectRoot, '.env.prod')
      );
    });

    // Start with test (evaluate phase)
    switchEnv('test');
    expect(getCurrentEnv()).toBe('test');

    // Switch to prod (release phase)
    switchEnv('prod');
    expect(getCurrentEnv()).toBe('prod');
    expect(process.env.FRACTARY_ENV).toBe('prod');
  });

  it('should reject invalid environment names', () => {
    const result1 = switchEnv('');
    expect(result1).toBe(false);

    const result2 = switchEnv('test;rm -rf /');
    expect(result2).toBe(false);

    const result3 = switchEnv('test$(whoami)');
    expect(result3).toBe(false);
  });

  it('should allow valid environment names with dashes and underscores', () => {
    mockedFs.existsSync.mockReturnValue(true);

    expect(switchEnv('my-test')).toBe(true);
    expect(switchEnv('my_test')).toBe(true);
    expect(switchEnv('test-2')).toBe(true);
  });
});

describe('clearEnv', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should clear default Fractary environment variables', () => {
    // Set some env vars
    process.env.GITHUB_TOKEN = 'test-token';
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';

    clearEnv();

    expect(process.env.GITHUB_TOKEN).toBeUndefined();
    expect(process.env.AWS_ACCESS_KEY_ID).toBeUndefined();
    expect(process.env.AWS_SECRET_ACCESS_KEY).toBeUndefined();
  });

  it('should clear specific variables when provided', () => {
    process.env.GITHUB_TOKEN = 'test-token';
    process.env.CUSTOM_VAR = 'custom-value';
    process.env.ANOTHER_VAR = 'another-value';

    clearEnv(['CUSTOM_VAR', 'ANOTHER_VAR']);

    // GITHUB_TOKEN should remain (not in the list)
    expect(process.env.GITHUB_TOKEN).toBe('test-token');
    expect(process.env.CUSTOM_VAR).toBeUndefined();
    expect(process.env.ANOTHER_VAR).toBeUndefined();

    // Cleanup
    delete process.env.GITHUB_TOKEN;
  });

  it('should reset getCurrentEnv to undefined', () => {
    mockedFs.existsSync.mockReturnValue(true);

    // Load an environment first
    process.env.FRACTARY_ENV = 'test';
    loadEnv({ force: true });
    expect(getCurrentEnv()).toBe('test');

    // Clear should reset
    clearEnv();
    expect(getCurrentEnv()).toBeUndefined();
  });
});
