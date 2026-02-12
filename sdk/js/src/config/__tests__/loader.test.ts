/**
 * Unit tests for config loader
 */

import {
  loadEnv,
  isEnvLoaded,
  getCurrentEnv,
  switchEnv,
  clearEnv,
  getEnvDir,
  ensureEnvDir,
  listEnvFiles,
  resolveEnvFile,
  readManagedSection,
  writeManagedSection,
} from '../loader';
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
    // Reset internal state
    clearEnv();
  });

  afterAll(() => {
    process.cwd = originalCwd;
    if (originalEnv !== undefined) {
      process.env.FRACTARY_ENV = originalEnv;
    } else {
      delete process.env.FRACTARY_ENV;
    }
  });

  describe('standard location (.fractary/env/)', () => {
    it('should load .env from .fractary/env/ when present', () => {
      const projectRoot = process.cwd();
      const standardPath = path.join(projectRoot, '.fractary', 'env', '.env');

      mockedFs.existsSync.mockImplementation((p) => {
        return String(p) === standardPath;
      });

      const result = loadEnv({ force: true });

      expect(result).toBe(true);
      expect(mockedDotenv.config).toHaveBeenCalledWith({
        path: standardPath,
        override: true,
      });
    });

    it('should load environment-specific file from .fractary/env/', () => {
      process.env.FRACTARY_ENV = 'prod';
      const projectRoot = process.cwd();
      const standardEnv = path.join(projectRoot, '.fractary', 'env', '.env');
      const standardProd = path.join(projectRoot, '.fractary', 'env', '.env.prod');

      mockedFs.existsSync.mockImplementation((p) => {
        const pathStr = String(p);
        return pathStr === standardEnv || pathStr === standardProd;
      });

      const result = loadEnv({ force: true });

      expect(result).toBe(true);
      expect(mockedDotenv.config).toHaveBeenCalledWith({
        path: standardEnv,
        override: true,
      });
      expect(mockedDotenv.config).toHaveBeenCalledWith({
        path: standardProd,
        override: true,
      });
    });
  });

  describe('legacy fallback (project root)', () => {
    it('should load .env from project root as fallback', () => {
      const projectRoot = process.cwd();
      const legacyPath = path.join(projectRoot, '.env');

      mockedFs.existsSync.mockImplementation((p) => {
        // Standard location doesn't exist, only legacy
        return String(p) === legacyPath;
      });

      const result = loadEnv({ force: true });

      expect(result).toBe(true);
      expect(mockedDotenv.config).toHaveBeenCalledWith({
        path: legacyPath,
        override: true,
      });
    });

    it('should fire deprecation warning when loading from root', () => {
      const projectRoot = process.cwd();
      const legacyPath = path.join(projectRoot, '.env');
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockedFs.existsSync.mockImplementation((p) => {
        return String(p) === legacyPath;
      });

      loadEnv({ force: true });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Deprecation')
      );
      warnSpy.mockRestore();
    });

    it('should fire deprecation warning only once per session', () => {
      const projectRoot = process.cwd();
      const legacyPath = path.join(projectRoot, '.env');
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockedFs.existsSync.mockImplementation((p) => {
        return String(p) === legacyPath;
      });

      loadEnv({ force: true });
      loadEnv({ force: true });

      const deprecationCalls = warnSpy.mock.calls.filter(
        (c) => String(c[0]).includes('Deprecation')
      );
      expect(deprecationCalls.length).toBe(1);
      warnSpy.mockRestore();
    });
  });

  describe('mixed standard and legacy', () => {
    it('should load .env from standard and .env.prod from legacy', () => {
      const projectRoot = process.cwd();
      process.env.FRACTARY_ENV = 'prod';
      const standardEnv = path.join(projectRoot, '.fractary', 'env', '.env');
      const legacyProd = path.join(projectRoot, '.env.prod');
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockedFs.existsSync.mockImplementation((p) => {
        const pathStr = String(p);
        return pathStr === standardEnv || pathStr === legacyProd;
      });

      const result = loadEnv({ force: true });

      expect(result).toBe(true);
      expect(mockedDotenv.config).toHaveBeenCalledWith({
        path: standardEnv,
        override: true,
      });
      expect(mockedDotenv.config).toHaveBeenCalledWith({
        path: legacyProd,
        override: true,
      });
      // Deprecation fired for legacy .env.prod
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Deprecation')
      );
      warnSpy.mockRestore();
    });
  });

  describe('existing behavior', () => {
    it('should not load again if already loaded', () => {
      const projectRoot = process.cwd();
      mockedFs.existsSync.mockImplementation((p) => {
        return String(p) === path.join(projectRoot, '.fractary', 'env', '.env');
      });

      loadEnv({ force: true });
      const callCount = mockedDotenv.config.mock.calls.length;

      loadEnv(); // Second call without force

      expect(mockedDotenv.config).toHaveBeenCalledTimes(callCount);
    });

    it('should reload with force option', () => {
      const projectRoot = process.cwd();
      mockedFs.existsSync.mockImplementation((p) => {
        const pathStr = String(p);
        return pathStr === path.join(projectRoot, '.fractary', 'env', '.env');
      });

      loadEnv({ force: true });
      const callCount = mockedDotenv.config.mock.calls.length;

      loadEnv({ force: true });

      expect(mockedDotenv.config.mock.calls.length).toBeGreaterThan(callCount);
    });

    it('should return false when no .env file found', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = loadEnv({ force: true });

      expect(result).toBe(false);
    });

    it('should load .env.local last for local overrides', () => {
      const projectRoot = process.cwd();
      const standardEnv = path.join(projectRoot, '.fractary', 'env', '.env');
      const standardLocal = path.join(projectRoot, '.fractary', 'env', '.env.local');

      mockedFs.existsSync.mockImplementation((p) => {
        const pathStr = String(p);
        return pathStr === standardEnv || pathStr === standardLocal;
      });

      loadEnv({ force: true });

      const calls = mockedDotenv.config.mock.calls.map((c) => String(c[0]?.path || ''));
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

  describe('clearEnv resets deprecationWarned', () => {
    it('should fire deprecation warning again after clearEnv', () => {
      const projectRoot = process.cwd();
      const legacyPath = path.join(projectRoot, '.env');
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockedFs.existsSync.mockImplementation((p) => {
        return String(p) === legacyPath;
      });

      loadEnv({ force: true });
      clearEnv();
      loadEnv({ force: true });

      const deprecationCalls = warnSpy.mock.calls.filter(
        (c) => String(c[0]).includes('Deprecation')
      );
      expect(deprecationCalls.length).toBe(2);
      warnSpy.mockRestore();
    });
  });
});

describe('isEnvLoaded', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearEnv();
  });

  it('should return true after successful loadEnv', () => {
    const projectRoot = process.cwd();
    mockedFs.existsSync.mockImplementation((p) => {
      return String(p) === path.join(projectRoot, '.fractary', 'env', '.env');
    });

    loadEnv({ force: true });

    expect(isEnvLoaded()).toBe(true);
  });
});

describe('switchEnv', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.FRACTARY_ENV;
    clearEnv();
  });

  it('should set FRACTARY_ENV and reload environment', () => {
    const projectRoot = process.cwd();
    const standardEnv = path.join(projectRoot, '.fractary', 'env', '.env');
    const standardTest = path.join(projectRoot, '.fractary', 'env', '.env.test');

    mockedFs.existsSync.mockImplementation((p) => {
      const pathStr = String(p);
      return pathStr === standardEnv || pathStr === standardTest;
    });

    const result = switchEnv('test');

    expect(result).toBe(true);
    expect(process.env.FRACTARY_ENV).toBe('test');
    expect(getCurrentEnv()).toBe('test');
    expect(mockedDotenv.config).toHaveBeenCalledWith({
      path: standardTest,
      override: true,
    });
  });

  it('should allow switching between environments (FABR workflow)', () => {
    const projectRoot = process.cwd();
    const standardEnv = path.join(projectRoot, '.fractary', 'env', '.env');
    const standardTest = path.join(projectRoot, '.fractary', 'env', '.env.test');
    const standardProd = path.join(projectRoot, '.fractary', 'env', '.env.prod');

    mockedFs.existsSync.mockImplementation((p) => {
      const pathStr = String(p);
      return (
        pathStr === standardEnv ||
        pathStr === standardTest ||
        pathStr === standardProd
      );
    });

    switchEnv('test');
    expect(getCurrentEnv()).toBe('test');

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

    expect(process.env.GITHUB_TOKEN).toBe('test-token');
    expect(process.env.CUSTOM_VAR).toBeUndefined();
    expect(process.env.ANOTHER_VAR).toBeUndefined();

    delete process.env.GITHUB_TOKEN;
  });

  it('should reset getCurrentEnv to undefined', () => {
    const projectRoot = process.cwd();
    mockedFs.existsSync.mockImplementation((p) => {
      return String(p) === path.join(projectRoot, '.fractary', 'env', '.env');
    });

    process.env.FRACTARY_ENV = 'test';
    loadEnv({ force: true });
    expect(getCurrentEnv()).toBe('test');

    clearEnv();
    expect(getCurrentEnv()).toBeUndefined();
  });

  it('should reset isEnvLoaded to false', () => {
    mockedFs.existsSync.mockReturnValue(true);

    loadEnv({ force: true });
    expect(isEnvLoaded()).toBe(true);

    clearEnv();
    expect(isEnvLoaded()).toBe(false);
  });
});

describe('getEnvDir', () => {
  it('should return .fractary/env/ under project root', () => {
    const projectRoot = '/my/project';
    const result = getEnvDir(projectRoot);
    expect(result).toBe(path.join(projectRoot, '.fractary', 'env'));
  });
});

describe('ensureEnvDir', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create directory if it does not exist', () => {
    const projectRoot = '/my/project';
    mockedFs.existsSync.mockReturnValue(false);

    const result = ensureEnvDir(projectRoot);

    expect(result).toBe(path.join(projectRoot, '.fractary', 'env'));
    expect(mockedFs.mkdirSync).toHaveBeenCalledWith(
      path.join(projectRoot, '.fractary', 'env'),
      { recursive: true }
    );
  });

  it('should not create directory if it already exists', () => {
    const projectRoot = '/my/project';
    mockedFs.existsSync.mockReturnValue(true);

    ensureEnvDir(projectRoot);

    expect(mockedFs.mkdirSync).not.toHaveBeenCalled();
  });
});

describe('resolveEnvFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should prefer standard location', () => {
    const projectRoot = '/my/project';
    const standardPath = path.join(projectRoot, '.fractary', 'env', '.env.test');

    mockedFs.existsSync.mockImplementation((p) => {
      return String(p) === standardPath;
    });

    const result = resolveEnvFile('.env.test', projectRoot);

    expect(result).toEqual({ path: standardPath, location: 'standard' });
  });

  it('should fall back to legacy location', () => {
    const projectRoot = '/my/project';
    const legacyPath = path.join(projectRoot, '.env.test');

    mockedFs.existsSync.mockImplementation((p) => {
      return String(p) === legacyPath;
    });

    const result = resolveEnvFile('.env.test', projectRoot);

    expect(result).toEqual({ path: legacyPath, location: 'legacy' });
  });

  it('should return null if file not found anywhere', () => {
    mockedFs.existsSync.mockReturnValue(false);

    const result = resolveEnvFile('.env.test', '/my/project');

    expect(result).toBeNull();
  });
});

describe('listEnvFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return standard files from .fractary/env/', () => {
    const projectRoot = '/my/project';
    const envDir = path.join(projectRoot, '.fractary', 'env');

    mockedFs.existsSync.mockImplementation((p) => {
      const pathStr = String(p);
      return pathStr === envDir || pathStr === projectRoot;
    });
    mockedFs.readdirSync.mockImplementation(((p: string) => {
      if (String(p) === envDir) return ['.env', '.env.test', '.env.prod'] as any;
      return [] as any;
    }) as any);

    const result = listEnvFiles(projectRoot);

    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: '(default)', location: 'standard' }),
      expect.objectContaining({ name: 'prod', location: 'standard' }),
      expect.objectContaining({ name: 'test', location: 'standard' }),
    ]));
  });

  it('should return legacy files from project root', () => {
    const projectRoot = '/my/project';

    mockedFs.existsSync.mockImplementation((p) => {
      const pathStr = String(p);
      return pathStr === projectRoot; // envDir does not exist
    });
    mockedFs.readdirSync.mockImplementation(((p: string) => {
      if (String(p) === projectRoot) return ['.env', '.env.prod'] as any;
      return [] as any;
    }) as any);

    const result = listEnvFiles(projectRoot);

    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: '(default)', file: '.env', location: 'legacy' }),
      expect.objectContaining({ name: 'prod', file: '.env.prod', location: 'legacy' }),
    ]));
  });

  it('should deduplicate (standard wins over legacy)', () => {
    const projectRoot = '/my/project';
    const envDir = path.join(projectRoot, '.fractary', 'env');

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockImplementation(((p: string) => {
      if (String(p) === envDir) return ['.env', '.env.test'] as any;
      if (String(p) === projectRoot) return ['.env', '.env.test', '.env.prod'] as any;
      return [] as any;
    }) as any);

    const result = listEnvFiles(projectRoot);

    // .env and .env.test should be standard, .env.prod should be legacy
    const envDefault = result.find((e) => e.name === '(default)');
    const envTest = result.find((e) => e.name === 'test');
    const envProd = result.find((e) => e.name === 'prod');

    expect(envDefault?.location).toBe('standard');
    expect(envTest?.location).toBe('standard');
    expect(envProd?.location).toBe('legacy');
  });

  it('should exclude .env.example', () => {
    const projectRoot = '/my/project';
    const envDir = path.join(projectRoot, '.fractary', 'env');

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockImplementation(((p: string) => {
      if (String(p) === envDir) return ['.env', '.env.example'] as any;
      return [] as any;
    }) as any);

    const result = listEnvFiles(projectRoot);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('(default)');
  });
});

describe('readManagedSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should parse a plugin section correctly', () => {
    const filePath = '/my/project/.fractary/env/.env.test';
    const content = [
      '# ===== fractary-core (managed) =====',
      'GITHUB_TOKEN=ghp_abc123',
      'AWS_REGION=us-east-1',
      '# ===== end fractary-core =====',
    ].join('\n');

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(content);

    const result = readManagedSection(filePath, 'fractary-core');

    expect(result).toEqual({
      GITHUB_TOKEN: 'ghp_abc123',
      AWS_REGION: 'us-east-1',
    });
  });

  it('should return null for missing section', () => {
    const filePath = '/my/project/.fractary/env/.env.test';
    const content = [
      '# ===== fractary-other (managed) =====',
      'KEY=value',
      '# ===== end fractary-other =====',
    ].join('\n');

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(content);

    const result = readManagedSection(filePath, 'fractary-core');

    expect(result).toBeNull();
  });

  it('should return null for missing file', () => {
    mockedFs.existsSync.mockReturnValue(false);

    const result = readManagedSection('/nonexistent', 'fractary-core');

    expect(result).toBeNull();
  });

  it('should skip comment lines within section', () => {
    const content = [
      '# ===== fractary-core (managed) =====',
      'GITHUB_TOKEN=ghp_abc123',
      '# This is a comment',
      '# AWS_ACCESS_KEY_ID=',
      'AWS_REGION=us-east-1',
      '# ===== end fractary-core =====',
    ].join('\n');

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(content);

    const result = readManagedSection('/file', 'fractary-core');

    expect(result).toEqual({
      GITHUB_TOKEN: 'ghp_abc123',
      AWS_REGION: 'us-east-1',
    });
  });

  it('should handle multiple sections in same file', () => {
    const content = [
      '# ===== fractary-core (managed) =====',
      'GITHUB_TOKEN=ghp_abc123',
      '# ===== end fractary-core =====',
      '',
      '# ===== fractary-faber-cloud (managed) =====',
      'FABER_CLOUD_AWS_ACCOUNT_ID=123456789012',
      '# ===== end fractary-faber-cloud =====',
    ].join('\n');

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(content);

    const core = readManagedSection('/file', 'fractary-core');
    const cloud = readManagedSection('/file', 'fractary-faber-cloud');

    expect(core).toEqual({ GITHUB_TOKEN: 'ghp_abc123' });
    expect(cloud).toEqual({ FABER_CLOUD_AWS_ACCOUNT_ID: '123456789012' });
  });
});

describe('writeManagedSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create file with section if file does not exist', () => {
    mockedFs.existsSync.mockReturnValue(false);

    writeManagedSection('/file', 'fractary-core', {
      GITHUB_TOKEN: 'ghp_abc123',
    });

    expect(mockedFs.mkdirSync).toHaveBeenCalled();
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      '/file',
      expect.stringContaining('# ===== fractary-core (managed) ====='),
      'utf-8'
    );
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      '/file',
      expect.stringContaining('GITHUB_TOKEN=ghp_abc123'),
      'utf-8'
    );
  });

  it('should append section if it does not exist in file', () => {
    mockedFs.existsSync.mockImplementation((_p) => {
      // Parent dir exists, file exists
      return true;
    });
    mockedFs.readFileSync.mockReturnValue('EXISTING_VAR=value\n');

    writeManagedSection('/file', 'fractary-core', {
      GITHUB_TOKEN: 'ghp_abc123',
    });

    const written = (mockedFs.writeFileSync as jest.Mock).mock.calls[0][1];
    expect(written).toContain('EXISTING_VAR=value');
    expect(written).toContain('# ===== fractary-core (managed) =====');
    expect(written).toContain('GITHUB_TOKEN=ghp_abc123');
    expect(written).toContain('# ===== end fractary-core =====');
  });

  it('should replace existing section without touching others', () => {
    const existingContent = [
      '# ===== fractary-core (managed) =====',
      'GITHUB_TOKEN=old_token',
      '# ===== end fractary-core =====',
      '',
      '# ===== fractary-faber-cloud (managed) =====',
      'FABER_CLOUD_AWS_ACCOUNT_ID=123456789012',
      '# ===== end fractary-faber-cloud =====',
    ].join('\n');

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(existingContent);

    writeManagedSection('/file', 'fractary-core', {
      GITHUB_TOKEN: 'new_token',
      AWS_REGION: 'eu-west-1',
    });

    const written = (mockedFs.writeFileSync as jest.Mock).mock.calls[0][1];
    // New values in core section
    expect(written).toContain('GITHUB_TOKEN=new_token');
    expect(written).toContain('AWS_REGION=eu-west-1');
    // Old core value gone
    expect(written).not.toContain('old_token');
    // Other section untouched
    expect(written).toContain('FABER_CLOUD_AWS_ACCOUNT_ID=123456789012');
    expect(written).toContain('# ===== fractary-faber-cloud (managed) =====');
  });
});

describe('edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.FRACTARY_ENV;
    clearEnv();
  });

  it('should still work when FRACTARY_ENV file does not exist', () => {
    const projectRoot = process.cwd();
    process.env.FRACTARY_ENV = 'nonexistent';

    mockedFs.existsSync.mockImplementation((p) => {
      const pathStr = String(p);
      return pathStr === path.join(projectRoot, '.fractary', 'env', '.env');
    });

    const result = loadEnv({ force: true });

    expect(result).toBe(true);
    expect(getCurrentEnv()).toBe('nonexistent');
    expect(mockedDotenv.config).toHaveBeenCalledWith({
      path: path.join(projectRoot, '.fractary', 'env', '.env'),
      override: true,
    });
  });

  it('should load all three files in correct order when all exist', () => {
    const projectRoot = process.cwd();
    process.env.FRACTARY_ENV = 'prod';

    mockedFs.existsSync.mockImplementation((p) => {
      const pathStr = String(p);
      return (
        pathStr === path.join(projectRoot, '.fractary', 'env', '.env') ||
        pathStr === path.join(projectRoot, '.fractary', 'env', '.env.prod') ||
        pathStr === path.join(projectRoot, '.fractary', 'env', '.env.local')
      );
    });

    loadEnv({ force: true });

    const calls = mockedDotenv.config.mock.calls.map((c) => String(c[0]?.path || ''));

    const envIndex = calls.findIndex((p) => p.endsWith('.env') && !p.includes('.prod') && !p.includes('.local'));
    const prodIndex = calls.findIndex((p) => p.endsWith('.env.prod'));
    const localIndex = calls.findIndex((p) => p.endsWith('.env.local'));

    expect(envIndex).toBeGreaterThanOrEqual(0);
    expect(prodIndex).toBeGreaterThan(envIndex);
    expect(localIndex).toBeGreaterThan(prodIndex);
  });

  it('should allow loadEnv after clearEnv to reload files', () => {
    mockedFs.existsSync.mockReturnValue(true);

    loadEnv({ force: true });
    expect(isEnvLoaded()).toBe(true);
    const initialCallCount = mockedDotenv.config.mock.calls.length;

    clearEnv();
    expect(isEnvLoaded()).toBe(false);

    loadEnv();
    expect(isEnvLoaded()).toBe(true);
    expect(mockedDotenv.config.mock.calls.length).toBeGreaterThan(initialCallCount);
  });
});
