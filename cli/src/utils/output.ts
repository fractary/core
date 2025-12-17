/**
 * Output Formatting Utilities
 *
 * Provides standardized output formatting for both JSON and text modes.
 */

import chalk from 'chalk';
import Table from 'cli-table3';

/**
 * Output options
 */
export interface OutputOptions {
  json?: boolean;
}

/**
 * Output a success message with data
 *
 * @param data - The data to output
 * @param options - Output options
 */
export function success(data: any, options: OutputOptions = {}): void {
  if (options.json) {
    console.log(JSON.stringify({ status: 'success', data }, null, 2));
  } else {
    // For text mode, the caller is responsible for formatting
    // This function is here for consistency with the JSON mode
    console.log(data);
  }
}

/**
 * Output an error message
 *
 * @param message - The error message
 * @param code - The error code
 * @param options - Output options
 */
export function error(message: string, code: string, options: OutputOptions = {}): void {
  if (options.json) {
    console.error(JSON.stringify({ status: 'error', error: { code, message } }, null, 2));
  } else {
    console.error(chalk.red('Error:'), message);
  }
}

/**
 * Output a warning message
 *
 * @param message - The warning message
 * @param options - Output options
 */
export function warning(message: string, options: OutputOptions = {}): void {
  if (options.json) {
    console.warn(JSON.stringify({ status: 'warning', message }, null, 2));
  } else {
    console.warn(chalk.yellow('Warning:'), message);
  }
}

/**
 * Output an info message
 *
 * @param message - The info message
 * @param options - Output options
 */
export function info(message: string, options: OutputOptions = {}): void {
  if (options.json) {
    console.log(JSON.stringify({ status: 'info', message }, null, 2));
  } else {
    console.log(chalk.blue('ℹ'), message);
  }
}

/**
 * Create a formatted table
 *
 * @param headers - Table headers
 * @param rows - Table rows
 * @returns Formatted table as string
 */
export function formatTable(headers: string[], rows: string[][]): string {
  const table = new Table({
    head: headers.map(h => chalk.bold(h)),
    style: {
      head: [],
      border: [],
    },
  });

  rows.forEach(row => table.push(row));

  return table.toString();
}

/**
 * Format a list of items
 *
 * @param items - The items to format
 * @param bullet - The bullet character (default: •)
 * @returns Formatted list as string
 */
export function formatList(items: string[], bullet: string = '•'): string {
  return items.map(item => `  ${chalk.gray(bullet)} ${item}`).join('\n');
}

/**
 * Format a key-value pair
 *
 * @param key - The key
 * @param value - The value
 * @param options - Formatting options
 * @returns Formatted key-value as string
 */
export function formatKeyValue(
  key: string,
  value: string | number | boolean,
  options: { color?: boolean } = {}
): string {
  const formattedKey = options.color !== false ? chalk.bold(key) : key;
  return `${formattedKey}: ${value}`;
}

/**
 * Format a section with title and content
 *
 * @param title - The section title
 * @param content - The section content
 * @returns Formatted section as string
 */
export function formatSection(title: string, content: string): string {
  return `\n${chalk.bold.underline(title)}\n${content}\n`;
}

/**
 * Format a success checkmark
 *
 * @param message - The success message
 * @returns Formatted success message
 */
export function formatSuccess(message: string): string {
  return chalk.green('✓') + ' ' + message;
}

/**
 * Format an error cross
 *
 * @param message - The error message
 * @returns Formatted error message
 */
export function formatError(message: string): string {
  return chalk.red('✗') + ' ' + message;
}

/**
 * Format a spinner/loading message
 *
 * @param message - The loading message
 * @returns Formatted loading message
 */
export function formatLoading(message: string): string {
  return chalk.cyan('◷') + ' ' + message;
}

/**
 * Truncate a string to a maximum length
 *
 * @param str - The string to truncate
 * @param maxLength - The maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Format a timestamp
 *
 * @param date - The date to format
 * @param options - Formatting options
 * @returns Formatted timestamp
 */
export function formatTimestamp(
  date: Date | string,
  options: { relative?: boolean } = {}
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (options.relative) {
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  return d.toLocaleString();
}
