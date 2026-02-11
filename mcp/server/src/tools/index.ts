/**
 * Tool registration system - combines all module tools
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { logsTools } from './logs.js';
import { fileTools } from './file.js';
import { docsTools } from './docs.js';
import { workTools } from './work.js';
import { repoTools } from './repo.js';

/**
 * All MCP tools across 5 modules
 */
export const allTools: Tool[] = [
  ...logsTools,   // 5 tools
  ...fileTools,   // 7 tools
  ...docsTools,   // 7 tools
  ...workTools,   // 19 tools
  ...repoTools,   // 37 tools
];
