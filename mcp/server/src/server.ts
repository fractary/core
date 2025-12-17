#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './config.js';
import { allTools } from './tools/index.js';
import { handleToolCall } from './handlers/index.js';

/**
 * Main function to start the MCP server
 */
async function main(): Promise<void> {
  // Load configuration
  const config = await loadConfig();

  // Create MCP server
  const server = new Server(
    {
      name: 'fractary-core',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register list tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: allTools,
  }));

  // Register call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return handleToolCall(name, args || {}, config);
  });

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Fractary Core MCP server running on stdio');
}

// Run the server
main().catch((error) => {
  console.error('Fatal error in MCP server:', error);
  process.exit(1);
});
