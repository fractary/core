import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Helper function to create a successful tool result
 * @param data - The data to return
 * @returns CallToolResult with success data
 */
export function successResult(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Helper function to create an error tool result
 * @param message - The error message
 * @returns CallToolResult with error
 */
export function errorResult(message: string): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message }, null, 2),
      },
    ],
    isError: true,
  };
}
