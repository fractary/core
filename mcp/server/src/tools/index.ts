/**
 * Tool registration system - combines all module tools
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { specTools } from './spec.js';
import { logsTools } from './logs.js';
import { fileTools } from './file.js';
import { docsTools } from './docs.js';
import { workTools } from './work.js';
import { repoTools } from './repo.js';

/**
 * All 81 MCP tools across 6 modules
 */
export const allTools: Tool[] = [
  ...specTools,   // 5 tools
  ...logsTools,   // 5 tools
  ...fileTools,   // 7 tools
  ...docsTools,   // 7 tools
  ...workTools,   // 19 tools
  ...repoTools,   // 38 tools
];
