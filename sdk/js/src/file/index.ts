/**
 * @fractary/core - File Module
 *
 * File storage operations across local and cloud storage backends.
 *
 * Supported backends:
 * - LocalStorage: Local filesystem
 * - S3Storage: AWS S3 (requires @aws-sdk/client-s3)
 * - R2Storage: Cloudflare R2 (requires @aws-sdk/client-s3)
 * - GCSStorage: Google Cloud Storage (requires @google-cloud/storage)
 * - GDriveStorage: Google Drive (requires googleapis)
 */

// Core exports
export { FileManager, FileManagerOptions } from './manager';
export { LocalStorage } from './local';

// Cloud storage implementations (lazy loaded)
export { S3Storage } from './s3';
export { R2Storage } from './r2';
export { GCSStorage } from './gcs';
export { GDriveStorage } from './gdrive';

// Factory functions
export {
  createStorage,
  createStorageFromSource,
  sourceConfigToStorageConfig,
  getDefaultStorageType,
} from './factory';

// Type exports
export * from './types';
