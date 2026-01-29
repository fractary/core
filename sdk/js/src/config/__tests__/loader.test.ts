/**
 * Unit tests for config loader
 */

import { loadEnv, isEnvLoaded, getCurrentEnv } from '../loader';
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
      process.env.FRACTARY_ENV = 'production';
      const projectRoot = process.cwd();

      mockedFs.existsSync.mockImplementation((p) => {
        const pathStr = String(p);
        // Both .env and .env.production exist
        return (
          pathStr === path.join(projectRoot, '.env') ||
          pathStr === path.join(projectRoot, '.env.production')
        );
      });

      const result = loadEnv({ force: true });

      expect(result).toBe(true);
      // Should load .env first, then .env.production
      expect(mockedDotenv.config).toHaveBeenCalledWith({
        path: path.join(projectRoot, '.env'),
        override: true,
      });
      expect(mockedDotenv.config).toHaveBeenCalledWith({
        path: path.join(projectRoot, '.env.production'),
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
