/**
 * @fractary/core - S3 Storage Implementation
 *
 * AWS S3 storage backend for file operations.
 * Uses AWS SDK v3 with lazy loading to avoid hard dependencies.
 */

import { Storage, S3StorageConfig } from './types';

// Type-only import for better type safety (doesn't cause runtime import)
type S3Client = import('@aws-sdk/client-s3').S3Client;

/**
 * AWS S3 storage implementation
 */
export class S3Storage implements Storage {
  private config: S3StorageConfig;
  private s3Client: S3Client | null = null;

  constructor(config: S3StorageConfig) {
    this.config = config;
  }

  /**
   * Get or create the S3 client (lazy loaded)
   */
  private async getClient(): Promise<S3Client> {
    if (this.s3Client) {
      return this.s3Client;
    }

    try {
      // Dynamic import to avoid hard dependency
      const { S3Client } = await import('@aws-sdk/client-s3');
      const { fromIni } = await import('@aws-sdk/credential-providers');

      const clientConfig: any = {
        region: this.config.region,
      };

      // Configure endpoint for S3-compatible services
      if (this.config.endpoint) {
        clientConfig.endpoint = this.config.endpoint;
        clientConfig.forcePathStyle = true;
      }

      // Configure credentials
      if (this.config.auth?.accessKeyId && this.config.auth?.secretAccessKey) {
        clientConfig.credentials = {
          accessKeyId: this.config.auth.accessKeyId,
          secretAccessKey: this.config.auth.secretAccessKey,
        };
      } else if (this.config.auth?.profile) {
        clientConfig.credentials = fromIni({ profile: this.config.auth.profile });
      }
      // Otherwise, use default credential chain (IAM role, env vars, etc.)

      this.s3Client = new S3Client(clientConfig);
      return this.s3Client;
    } catch (error) {
      throw new Error(
        'AWS SDK not available. Install with: npm install @aws-sdk/client-s3 @aws-sdk/credential-providers'
      );
    }
  }

  /**
   * Get the full S3 key with optional prefix
   */
  private getKey(id: string): string {
    if (this.config.prefix) {
      return `${this.config.prefix.replace(/\/$/, '')}/${id}`;
    }
    return id;
  }

  /**
   * Write content to S3
   */
  async write(id: string, content: string): Promise<string> {
    const client = await this.getClient();
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');

    const key = this.getKey(id);
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      Body: content,
      ContentType: 'text/plain; charset=utf-8',
    });

    await client.send(command);
    return `s3://${this.config.bucket}/${key}`;
  }

  /**
   * Read content from S3
   */
  async read(id: string): Promise<string | null> {
    const client = await this.getClient();
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');

    const key = this.getKey(id);

    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      const response = await client.send(command);

      // Convert stream to string
      if (response.Body) {
        const bodyContents = await response.Body.transformToString();
        return bodyContents;
      }
      return null;
    } catch (error: any) {
      if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Check if object exists in S3
   */
  async exists(id: string): Promise<boolean> {
    const client = await this.getClient();
    const { HeadObjectCommand } = await import('@aws-sdk/client-s3');

    const key = this.getKey(id);

    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      await client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * List objects in S3 with optional prefix
   */
  async list(prefix?: string): Promise<string[]> {
    const client = await this.getClient();
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');

    const fullPrefix = prefix ? this.getKey(prefix) : this.config.prefix || '';
    const results: string[] = [];
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucket,
        Prefix: fullPrefix,
        ContinuationToken: continuationToken,
      });

      const response = await client.send(command);

      if (response.Contents) {
        for (const item of response.Contents) {
          if (item.Key) {
            // Remove the configured prefix from the key for consistency
            let key = item.Key;
            if (this.config.prefix && key.startsWith(this.config.prefix)) {
              key = key.slice(this.config.prefix.length).replace(/^\//, '');
            }
            results.push(key);
          }
        }
      }

      continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken);

    return results;
  }

  /**
   * Delete object from S3
   */
  async delete(id: string): Promise<void> {
    const client = await this.getClient();
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');

    const key = this.getKey(id);
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    await client.send(command);
  }

  /**
   * Get a presigned URL for the object
   */
  async getUrl(id: string, expiresIn: number = 86400): Promise<string | null> {
    // If a public URL is configured, use it
    if (this.config.publicUrl) {
      const key = this.getKey(id);
      return `${this.config.publicUrl.replace(/\/$/, '')}/${key}`;
    }

    const client = await this.getClient();

    try {
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');

      const key = this.getKey(id);
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      const url = await getSignedUrl(client, command, { expiresIn });
      return url;
    } catch (error) {
      // Fall back to S3 URI if presigner not available
      const key = this.getKey(id);
      return `s3://${this.config.bucket}/${key}`;
    }
  }

  /**
   * Get the bucket name
   */
  getBucket(): string {
    return this.config.bucket;
  }

  /**
   * Get the configured prefix
   */
  getPrefix(): string | undefined {
    return this.config.prefix;
  }
}
