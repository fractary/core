/**
 * @fractary/core-mcp - MCP server for Fractary Core SDK
 *
 * This package provides MCP (Model Context Protocol) tools for universal access
 * to Fractary Core SDK functionality across work tracking, repository management,
 * specifications, logs, file storage, and documentation.
 */

// Export configuration
export { loadConfig } from './config.js';
export type { Config } from './config.js';

// Export types
export * from './types.js';

// Export tools
export { allTools } from './tools/index.js';

// Export handlers
export { handleToolCall } from './handlers/index.js';
