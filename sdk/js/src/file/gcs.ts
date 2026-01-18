/**
 * @fractary/core - GCS Storage Implementation
 *
 * Google Cloud Storage backend for file operations.
 * Uses @google-cloud/storage with lazy loading.
 */

import { Storage, GCSStorageConfig } from './types';

// Type-only imports for better type safety (doesn't cause runtime import)
type GCStorage = import('@google-cloud/storage').Storage;
type GCSBucket = import('@google-cloud/storage').Bucket;

/**
 * Google Cloud Storage implementation
 */
export class GCSStorage implements Storage {
  private config: GCSStorageConfig;
  private storageClient: GCStorage | null = null;
  private bucket: GCSBucket | null = null;

  constructor(config: GCSStorageConfig) {
    this.config = config;
  }

  /**
   * Get or create the GCS client (lazy loaded)
   */
  private async getClient(): Promise<{ storage: GCStorage; bucket: GCSBucket }> {
    if (this.storageClient && this.bucket) {
      return { storage: this.storageClient, bucket: this.bucket };
    }

    try {
      // Dynamic import to avoid hard dependency
      const { Storage: GCStorage } = await import('@google-cloud/storage');

      const clientConfig: any = {
        projectId: this.config.projectId,
      };

      // Use key file if provided
      if (this.config.keyFilePath) {
        clientConfig.keyFilename = this.config.keyFilePath;
      }
      // Otherwise, use Application Default Credentials (ADC)

      this.storageClient = new GCStorage(clientConfig);
      this.bucket = this.storageClient.bucket(this.config.bucket);

      return { storage: this.storageClient, bucket: this.bucket };
    } catch (error) {
      throw new Error(
        'Google Cloud Storage SDK not available. Install with: npm install @google-cloud/storage'
      );
    }
  }

  /**
   * Get the full GCS path with optional prefix
   */
  private getPath(id: string): string {
    if (this.config.prefix) {
      return `${this.config.prefix.replace(/\/$/, '')}/${id}`;
    }
    return id;
  }

  /**
   * Check if an error is a "not found" error
   * Google Cloud SDK uses error.code (number) or error.errors[].reason
   */
  private isNotFoundError(error: any): boolean {
    return (
      error.code === 404 ||
      error.code === 'ENOENT' ||
      error.errors?.some((e: any) => e.reason === 'notFound')
    );
  }

  /**
   * Write content to GCS
   */
  async write(id: string, content: string): Promise<string> {
    const { bucket } = await this.getClient();
    const path = this.getPath(id);
    const file = bucket.file(path);

    await file.save(content, {
      contentType: 'text/plain; charset=utf-8',
      resumable: false,
    });

    return `gs://${this.config.bucket}/${path}`;
  }

  /**
   * Read content from GCS
   */
  async read(id: string): Promise<string | null> {
    const { bucket } = await this.getClient();
    const path = this.getPath(id);
    const file = bucket.file(path);

    try {
      const [exists] = await file.exists();
      if (!exists) {
        return null;
      }

      const [contents] = await file.download();
      return contents.toString('utf-8');
    } catch (error: any) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Check if object exists in GCS
   */
  async exists(id: string): Promise<boolean> {
    const { bucket } = await this.getClient();
    const path = this.getPath(id);
    const file = bucket.file(path);

    try {
      const [exists] = await file.exists();
      return exists;
    } catch (error: any) {
      // Only treat "not found" as false, rethrow other errors
      if (this.isNotFoundError(error)) {
        return false;
      }
      throw error;
    }
  }

  /**
   * List objects in GCS with optional prefix
   */
  async list(prefix?: string): Promise<string[]> {
    const { bucket } = await this.getClient();
    const fullPrefix = prefix ? this.getPath(prefix) : this.config.prefix || '';

    const [files] = await bucket.getFiles({
      prefix: fullPrefix,
    });

    return files.map((file: any) => {
      let name = file.name;
      // Remove the configured prefix from the path for consistency
      if (this.config.prefix && name.startsWith(this.config.prefix)) {
        name = name.slice(this.config.prefix.length).replace(/^\//, '');
      }
      return name;
    });
  }

  /**
   * Delete object from GCS
   */
  async delete(id: string): Promise<void> {
    const { bucket } = await this.getClient();
    const path = this.getPath(id);
    const file = bucket.file(path);

    try {
      await file.delete();
    } catch (error: any) {
      // Ignore if file doesn't exist
      if (!this.isNotFoundError(error)) {
        throw error;
      }
    }
  }

  /**
   * Get a signed URL for the object
   */
  async getUrl(id: string, expiresIn: number = 86400): Promise<string | null> {
    const { bucket } = await this.getClient();
    const path = this.getPath(id);
    const file = bucket.file(path);

    try {
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
      });
      return url;
    } catch (error) {
      // Fall back to gs:// URI if signing fails (e.g., no key file)
      return `gs://${this.config.bucket}/${path}`;
    }
  }

  /**
   * Get the bucket name
   */
  getBucket(): string {
    return this.config.bucket;
  }

  /**
   * Get the project ID
   */
  getProjectId(): string {
    return this.config.projectId;
  }

  /**
   * Get the configured prefix
   */
  getPrefix(): string | undefined {
    return this.config.prefix;
  }
}
