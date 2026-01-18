/**
 * @fractary/core - Google Drive Storage Implementation
 *
 * Google Drive storage backend for file operations.
 * Uses googleapis with lazy loading.
 *
 * Note: Google Drive doesn't use traditional file paths. This implementation
 * maps path-like identifiers to Google Drive files by name within a folder.
 */

import { Storage, GDriveStorageConfig } from './types';

/**
 * Google Drive storage implementation
 */
export class GDriveStorage implements Storage {
  private config: GDriveStorageConfig;
  private driveClient: any = null;
  private auth: any = null;

  constructor(config: GDriveStorageConfig) {
    this.config = config;
  }

  /**
   * Get or create the Google Drive client (lazy loaded)
   */
  private async getClient(): Promise<any> {
    if (this.driveClient) {
      return this.driveClient;
    }

    try {
      // Dynamic import to avoid hard dependency
      const { google } = await import('googleapis');

      // Check if we have OAuth credentials
      if (this.config.clientId && this.config.clientSecret && this.config.refreshToken) {
        const oauth2Client = new google.auth.OAuth2(
          this.config.clientId,
          this.config.clientSecret
        );

        oauth2Client.setCredentials({
          refresh_token: this.config.refreshToken,
        });

        this.auth = oauth2Client;
        this.driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        // Use Application Default Credentials
        const auth = new google.auth.GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/drive'],
        });

        this.auth = await auth.getClient();
        this.driveClient = google.drive({ version: 'v3', auth: this.auth });
      }

      return this.driveClient;
    } catch (error) {
      throw new Error(
        'Google APIs SDK not available. Install with: npm install googleapis'
      );
    }
  }

  /**
   * Get the parent folder ID (internal helper)
   */
  private getParentFolderId(): string {
    return this.config.folderId || 'root';
  }

  /**
   * Extract file name from path-like ID
   */
  private getFileName(id: string): string {
    // Take the last part of the path as the file name
    const parts = id.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Find a file by name in the configured folder
   */
  private async findFile(id: string): Promise<string | null> {
    const drive = await this.getClient();
    const fileName = this.getFileName(id);
    const folderId = this.getParentFolderId();

    const response = await drive.files.list({
      q: `name = '${fileName}' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    return null;
  }

  /**
   * Write content to Google Drive
   */
  async write(id: string, content: string): Promise<string> {
    const drive = await this.getClient();
    const fileName = this.getFileName(id);
    const folderId = this.getParentFolderId();

    // Check if file already exists
    const existingFileId = await this.findFile(id);

    const media = {
      mimeType: 'text/plain',
      body: content,
    };

    let fileId: string;

    if (existingFileId) {
      // Update existing file
      const response = await drive.files.update({
        fileId: existingFileId,
        media,
        fields: 'id',
      });
      fileId = response.data.id;
    } else {
      // Create new file
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id',
      });
      fileId = response.data.id;
    }

    return `gdrive://${fileId}`;
  }

  /**
   * Read content from Google Drive
   */
  async read(id: string): Promise<string | null> {
    const drive = await this.getClient();

    // Check if id is a direct file ID or a path-like name
    let fileId = id;
    if (!id.match(/^[a-zA-Z0-9_-]{25,}$/)) {
      // Looks like a path, search for the file
      fileId = (await this.findFile(id)) || id;
    }

    try {
      const response = await drive.files.get({
        fileId,
        alt: 'media',
      });

      return response.data as string;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Check if file exists in Google Drive
   */
  async exists(id: string): Promise<boolean> {
    const fileId = await this.findFile(id);
    return fileId !== null;
  }

  /**
   * List files in the configured Google Drive folder
   */
  async list(prefix?: string): Promise<string[]> {
    const drive = await this.getClient();
    const folderId = this.getParentFolderId();
    const results: string[] = [];
    let pageToken: string | undefined;

    do {
      let query = `'${folderId}' in parents and trashed = false`;
      if (prefix) {
        query += ` and name contains '${prefix}'`;
      }

      const response = await drive.files.list({
        q: query,
        fields: 'nextPageToken, files(id, name)',
        spaces: 'drive',
        pageToken,
      });

      if (response.data.files) {
        for (const file of response.data.files) {
          results.push(file.name);
        }
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    return results;
  }

  /**
   * Delete file from Google Drive
   */
  async delete(id: string): Promise<void> {
    const drive = await this.getClient();

    // Check if id is a direct file ID or a path-like name
    let fileId = id;
    if (!id.match(/^[a-zA-Z0-9_-]{25,}$/)) {
      fileId = (await this.findFile(id)) || id;
    }

    try {
      await drive.files.delete({ fileId });
    } catch (error: any) {
      // Ignore if file doesn't exist
      if (error.code !== 404) {
        throw error;
      }
    }
  }

  /**
   * Get a shareable URL for the file
   */
  async getUrl(id: string, _expiresIn?: number): Promise<string | null> {
    // Check if id is a direct file ID or a path-like name
    let fileId = id;
    if (!id.match(/^[a-zA-Z0-9_-]{25,}$/)) {
      fileId = (await this.findFile(id)) || id;
    }

    // Return the standard Google Drive view URL
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  /**
   * Get the configured folder ID
   */
  getFolderId(): string {
    return this.config.folderId || 'root';
  }
}
