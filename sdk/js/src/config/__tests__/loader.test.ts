/**
 * Unit tests for config loader
 */

import { loadEnv, isEnvLoaded } from '../loader';
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

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the envLoaded state by calling with force
    // Since we can't access the private variable directly
  });

  afterAll(() => {
    process.cwd = originalCwd;
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
      mockedFs.existsSync.mockReturnValue(true);

      loadEnv({ force: true });
      const callCount = mockedDotenv.config.mock.calls.length;

      loadEnv({ force: true }); // Force reload

      expect(mockedDotenv.config).toHaveBeenCalledTimes(callCount + 1);
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
      });
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
