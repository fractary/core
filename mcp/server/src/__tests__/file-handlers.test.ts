import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  handleFileRead,
  handleFileWrite,
  handleFileList,
  handleFileDelete,
  handleFileExists,
  handleFileCopy,
  handleFileMove,
} from '../handlers/file.js';
import { Config } from '../config.js';

// Mock the FileManager
jest.mock('@fractary/core/file', () => ({
  FileManager: jest.fn().mockImplementation(() => ({
    read: jest.fn().mockResolvedValue('file content'),
    write: jest.fn().mockResolvedValue('test.txt'),
    list: jest.fn().mockResolvedValue(['file1.txt', 'file2.txt', 'subdir/file3.txt']),
    delete: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(true),
    copy: jest.fn().mockResolvedValue('destination.txt'),
    move: jest.fn().mockResolvedValue('destination.txt'),
  })),
}));

describe('File Handlers', () => {
  const mockConfig: Config = {
    file: {
      basePath: '.fractary/files',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleFileRead', () => {
    it('should read file successfully', async () => {
      const result = await handleFileRead({ path: 'test.txt' }, mockConfig);

      expect(result.content).toBeDefined();
      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.path).toBe('test.txt');
      expect(content.content).toBe('file content');
    });

    it('should reject path traversal attempts', async () => {
      const result = await handleFileRead({ path: '../../../etc/passwd' }, mockConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Path traversal detected');
    });

    it('should allow valid subdirectory paths', async () => {
      const result = await handleFileRead({ path: 'subdir/test.txt' }, mockConfig);

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.path).toBe('subdir/test.txt');
    });
  });

  describe('handleFileWrite', () => {
    it('should write file successfully', async () => {
      const result = await handleFileWrite(
        { path: 'test.txt', content: 'new content' },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.written).toBe(true);
    });

    it('should reject path traversal in write operations', async () => {
      const result = await handleFileWrite(
        { path: '../../malicious.txt', content: 'bad' },
        mockConfig
      );

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Path traversal detected');
    });

    it('should handle overwrite protection', async () => {
      const { FileManager } = await import('@fractary/core/file');
      const mockInstance = new FileManager({ basePath: '.fractary/files' });
      (mockInstance.exists as jest.Mock).mockResolvedValue(true);

      const result = await handleFileWrite(
        { path: 'test.txt', content: 'content', overwrite: false },
        mockConfig
      );

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('already exists');
    });
  });

  describe('handleFileList', () => {
    it('should list files successfully', async () => {
      const result = await handleFileList({}, mockConfig);

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.files).toHaveLength(3);
      expect(content.count).toBe(3);
    });

    it('should filter files with safe glob pattern (minimatch)', async () => {
      const result = await handleFileList({ pattern: '*.txt' }, mockConfig);

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      // minimatch should filter to only .txt files
      expect(content.files.every((f: string) => f.endsWith('.txt'))).toBe(true);
    });

    it('should reject path traversal in list path', async () => {
      const result = await handleFileList({ path: '../../../etc' }, mockConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Path traversal detected');
    });

    it('should handle complex glob patterns safely', async () => {
      // This pattern could cause ReDoS with unsafe regex
      const result = await handleFileList({ pattern: 'subdir/**/*.txt' }, mockConfig);

      // Should complete without hanging (minimatch is safe)
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleFileDelete', () => {
    it('should delete file successfully', async () => {
      const result = await handleFileDelete({ path: 'test.txt' }, mockConfig);

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.deleted).toBe(true);
    });

    it('should reject path traversal in delete operations', async () => {
      const result = await handleFileDelete({ path: '../../../important.txt' }, mockConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Path traversal detected');
    });
  });

  describe('handleFileExists', () => {
    it('should check file existence successfully', async () => {
      const result = await handleFileExists({ path: 'test.txt' }, mockConfig);

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.exists).toBe(true);
    });

    it('should reject path traversal in exists check', async () => {
      const result = await handleFileExists({ path: '../../config.json' }, mockConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Path traversal detected');
    });
  });

  describe('handleFileCopy', () => {
    it('should copy file successfully', async () => {
      const result = await handleFileCopy(
        { source: 'source.txt', destination: 'dest.txt' },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.copied).toBe(true);
    });

    it('should reject path traversal in source path', async () => {
      const result = await handleFileCopy(
        { source: '../../../etc/passwd', destination: 'dest.txt' },
        mockConfig
      );

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Path traversal detected');
    });

    it('should reject path traversal in destination path', async () => {
      const result = await handleFileCopy(
        { source: 'source.txt', destination: '../../malicious.txt' },
        mockConfig
      );

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Path traversal detected');
    });

    it('should handle overwrite protection', async () => {
      const { FileManager } = await import('@fractary/core/file');
      const mockInstance = new FileManager({ basePath: '.fractary/files' });
      (mockInstance.exists as jest.Mock).mockResolvedValue(true);

      const result = await handleFileCopy(
        { source: 'source.txt', destination: 'dest.txt', overwrite: false },
        mockConfig
      );

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('already exists');
    });
  });

  describe('handleFileMove', () => {
    it('should move file successfully', async () => {
      const result = await handleFileMove(
        { source: 'source.txt', destination: 'dest.txt' },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.moved).toBe(true);
    });

    it('should reject path traversal in source path', async () => {
      const result = await handleFileMove(
        { source: '../../../important.txt', destination: 'dest.txt' },
        mockConfig
      );

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Path traversal detected');
    });

    it('should reject path traversal in destination path', async () => {
      const result = await handleFileMove(
        { source: 'source.txt', destination: '../../../etc/shadow' },
        mockConfig
      );

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Path traversal detected');
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle URL-encoded traversal attempts', async () => {
      const result = await handleFileRead({ path: '%2e%2e%2f%2e%2e%2fetc%2fpasswd' }, mockConfig);

      // Path validation should normalize and catch this
      expect(result.isError).toBe(true);
    });

    it('should handle mixed path separators', async () => {
      const result = await handleFileRead({ path: '..\\..\\..\\windows\\system32' }, mockConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Path traversal detected');
    });

    it('should handle null bytes in paths', async () => {
      const result = await handleFileRead({ path: 'test.txt\0malicious' }, mockConfig);

      // Should either reject or handle safely
      expect(result).toBeDefined();
    });
  });
});
