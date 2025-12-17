/**
 * Logs utility functions
 */

import chalk from 'chalk';

/**
 * Get color function for log type
 *
 * @param type - Log type
 * @returns Chalk color function
 */
export function getTypeColor(type: string): (text: string) => string {
  switch (type.toLowerCase()) {
    case 'session':
      return chalk.blue;
    case 'build':
      return chalk.cyan;
    case 'deployment':
      return chalk.magenta;
    case 'test':
      return chalk.green;
    case 'debug':
      return chalk.yellow;
    case 'audit':
      return chalk.red;
    case 'operational':
      return chalk.white;
    case 'workflow':
      return chalk.blueBright;
    default:
      return chalk.gray;
  }
}
