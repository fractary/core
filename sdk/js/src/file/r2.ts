/**
 * @fractary/core - R2 Storage Implementation
 *
 * Cloudflare R2 storage backend for file operations.
 * R2 is S3-compatible, so this uses the AWS SDK with R2 endpoint.
 */

import { Storage, R2StorageConfig, S3StorageConfig } from './types';
import { S3Storage } from './s3';

/**
 * Cloudflare R2 storage implementation
 *
 * Uses S3Storage internally with R2-specific endpoint configuration.
 */
export class R2Storage implements Storage {
  private s3Storage: S3Storage;
  private config: R2StorageConfig;

  constructor(config: R2StorageConfig) {
    this.config = config;

    // Convert R2 config to S3-compatible config
    const s3Config: S3StorageConfig = {
      type: 's3',
      bucket: config.bucket,
      region: 'auto', // R2 uses 'auto' region
      prefix: config.prefix,
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      publicUrl: config.publicUrl,
      auth: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    };

    this.s3Storage = new S3Storage(s3Config);
  }

  /**
   * Write content to R2
   */
  async write(id: string, content: string | Buffer): Promise<string> {
    const result = await this.s3Storage.write(id, content);
    // Return R2-style URI
    return result.replace('s3://', 'r2://');
  }

  /**
   * Read content from R2
   */
  async read(id: string): Promise<string | null> {
    return this.s3Storage.read(id);
  }

  /**
   * Check if object exists in R2
   */
  async exists(id: string): Promise<boolean> {
    return this.s3Storage.exists(id);
  }

  /**
   * List objects in R2 with optional prefix
   */
  async list(prefix?: string): Promise<string[]> {
    return this.s3Storage.list(prefix);
  }

  /**
   * Delete object from R2
   */
  async delete(id: string): Promise<void> {
    return this.s3Storage.delete(id);
  }

  /**
   * Get a URL for the object
   *
   * R2 supports presigned URLs, and can also use public bucket URLs.
   */
  async getUrl(id: string, expiresIn: number = 86400): Promise<string | null> {
    return this.s3Storage.getUrl(id, expiresIn);
  }

  /**
   * Get the bucket name
   */
  getBucket(): string {
    return this.config.bucket;
  }

  /**
   * Get the account ID
   */
  getAccountId(): string {
    return this.config.accountId;
  }

  /**
   * Get the configured prefix
   */
  getPrefix(): string | undefined {
    return this.config.prefix;
  }
}
