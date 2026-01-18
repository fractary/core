#!/usr/bin/env node
/**
 * File Storage CLI Wrapper
 *
 * Simple Node.js script for file storage operations using the SDK.
 * Used by shell scripts for backward compatibility.
 *
 * Usage:
 *   node storage.mjs upload <source> <local-path> <remote-path>
 *   node storage.mjs download <source> <remote-path> <local-path>
 *   node storage.mjs delete <source> <remote-path>
 *   node storage.mjs list <source> [prefix]
 *   node storage.mjs exists <source> <remote-path>
 *   node storage.mjs get-url <source> <remote-path> [expires-in]
 */

import { createStorageFromSource, createStorage } from '@fractary/core/file';
import { loadFileConfig } from '@fractary/core/common/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const [,, command, sourceName, ...args] = process.argv;

async function main() {
  try {
    // Load configuration
    const fileConfig = loadFileConfig();

    if (!fileConfig?.sources?.[sourceName]) {
      console.error(JSON.stringify({
        success: false,
        error: `Source '${sourceName}' not found in configuration`,
        available_sources: Object.keys(fileConfig?.sources || {})
      }));
      process.exit(1);
    }

    // Create storage for the source
    const storage = createStorageFromSource(sourceName, fileConfig);

    switch (command) {
      case 'upload': {
        const [localPath, remotePath] = args;
        if (!localPath || !remotePath) {
          throw new Error('Usage: upload <source> <local-path> <remote-path>');
        }

        // Read local file
        const content = fs.readFileSync(localPath, 'utf-8');
        const stats = fs.statSync(localPath);

        // Calculate checksum
        const hash = crypto.createHash('sha256');
        hash.update(content);
        const checksum = hash.digest('hex');

        // Upload
        const uri = await storage.write(remotePath, content);

        // Get URL if available
        let url = uri;
        if (storage.getUrl) {
          url = await storage.getUrl(remotePath) || uri;
        }

        console.log(JSON.stringify({
          success: true,
          source: sourceName,
          local_path: localPath,
          remote_path: remotePath,
          url: url,
          size_bytes: stats.size,
          checksum: `sha256:${checksum}`,
          uploaded_at: new Date().toISOString()
        }));
        break;
      }

      case 'download': {
        const [remotePath, localPath] = args;
        if (!remotePath || !localPath) {
          throw new Error('Usage: download <source> <remote-path> <local-path>');
        }

        // Download
        const content = await storage.read(remotePath);
        if (content === null) {
          console.log(JSON.stringify({
            success: false,
            error: `File not found: ${remotePath}`
          }));
          process.exit(1);
        }

        // Ensure directory exists
        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Write local file
        fs.writeFileSync(localPath, content);
        const stats = fs.statSync(localPath);

        // Calculate checksum
        const hash = crypto.createHash('sha256');
        hash.update(content);
        const checksum = hash.digest('hex');

        console.log(JSON.stringify({
          success: true,
          source: sourceName,
          remote_path: remotePath,
          local_path: localPath,
          size_bytes: stats.size,
          checksum: `sha256:${checksum}`,
          downloaded_at: new Date().toISOString()
        }));
        break;
      }

      case 'delete': {
        const [remotePath] = args;
        if (!remotePath) {
          throw new Error('Usage: delete <source> <remote-path>');
        }

        await storage.delete(remotePath);

        console.log(JSON.stringify({
          success: true,
          source: sourceName,
          remote_path: remotePath,
          deleted: true,
          deleted_at: new Date().toISOString()
        }));
        break;
      }

      case 'list': {
        const [prefix] = args;

        const files = await storage.list(prefix);

        console.log(JSON.stringify({
          success: true,
          source: sourceName,
          prefix: prefix || '',
          files: files,
          count: files.length
        }));
        break;
      }

      case 'exists': {
        const [remotePath] = args;
        if (!remotePath) {
          throw new Error('Usage: exists <source> <remote-path>');
        }

        const exists = await storage.exists(remotePath);

        console.log(JSON.stringify({
          success: true,
          source: sourceName,
          remote_path: remotePath,
          exists: exists
        }));
        break;
      }

      case 'get-url': {
        const [remotePath, expiresIn] = args;
        if (!remotePath) {
          throw new Error('Usage: get-url <source> <remote-path> [expires-in]');
        }

        let url = null;
        if (storage.getUrl) {
          url = await storage.getUrl(remotePath, expiresIn ? parseInt(expiresIn) : undefined);
        }

        console.log(JSON.stringify({
          success: true,
          source: sourceName,
          remote_path: remotePath,
          url: url,
          expires_in: expiresIn ? parseInt(expiresIn) : null
        }));
        break;
      }

      default:
        console.error(JSON.stringify({
          success: false,
          error: `Unknown command: ${command}`,
          available_commands: ['upload', 'download', 'delete', 'list', 'exists', 'get-url']
        }));
        process.exit(1);
    }
  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      error: error.message
    }));
    process.exit(1);
  }
}

main();
