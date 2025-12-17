import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { LogManager } from '@fractary/core/logs';
import { Config } from '../config.js';
import { successResult, errorResult } from './helpers.js';

/**
 * Handler for fractary_logs_capture
 */
export async function handleLogsCapture(
  params: {
    type: string;
    title: string;
    content: string;
    issue_number?: number;
    metadata?: Record<string, unknown>;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new LogManager(config.logs);
    const log = manager.writeLog({
      type: params.type as 'session' | 'build' | 'deployment' | 'test' | 'debug' | 'audit' | 'operational' | 'workflow',
      title: params.title,
      content: params.content,
      issueNumber: params.issue_number,
      metadata: params.metadata,
    });
    return successResult(log);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error capturing log: ${message}`);
  }
}

/**
 * Handler for fractary_logs_search
 */
export async function handleLogsSearch(
  params: {
    query: string;
    type?: string;
    issue_number?: number;
    since?: string;
    until?: string;
    regex?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new LogManager(config.logs);
    const results = manager.searchLogs({
      query: params.query,
      type: params.type as 'session' | 'build' | 'deployment' | 'test' | 'debug' | 'audit' | 'operational' | 'workflow' | undefined,
      issueNumber: params.issue_number,
      since: params.since,
      until: params.until,
      regex: params.regex,
    });
    return successResult(results);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error searching logs: ${message}`);
  }
}

/**
 * Handler for fractary_logs_archive
 */
export async function handleLogsArchive(
  params: {
    max_age_days?: number;
    compress?: boolean;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new LogManager(config.logs);
    const result = manager.archiveLogs({
      maxAgeDays: params.max_age_days,
      compress: params.compress,
    });
    return successResult(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error archiving logs: ${message}`);
  }
}

/**
 * Handler for fractary_logs_list
 */
export async function handleLogsList(
  params: {
    type?: string;
    status?: string;
    issue_number?: number;
    since?: string;
    until?: string;
    limit?: number;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new LogManager(config.logs);
    const logs = manager.listLogs({
      type: params.type as 'session' | 'build' | 'deployment' | 'test' | 'debug' | 'audit' | 'operational' | 'workflow' | undefined,
      status: params.status as 'active' | 'completed' | 'stopped' | 'success' | 'failure' | 'error' | undefined,
      issueNumber: params.issue_number,
      since: params.since,
      until: params.until,
      limit: params.limit,
    });
    return successResult(logs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error listing logs: ${message}`);
  }
}

/**
 * Handler for fractary_logs_read
 */
export async function handleLogsRead(
  params: { log_id: string },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new LogManager(config.logs);
    const log = manager.readLog(params.log_id);

    if (!log) {
      return errorResult(`Log not found: ${params.log_id}`);
    }

    return successResult(log);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error reading log: ${message}`);
  }
}
