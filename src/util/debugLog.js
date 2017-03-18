/* eslint no-console: 0 */

import chalk from 'chalk';

export function debug(...args) {
  console.log(chalk.grey('[🛠️ DEBUG]', ...args));
}

export function success(...args) {
  console.log(chalk.green('✔', ...args));
}

export function log(...args) {
  console.log('➡', ...args);
}

export function warn(...args) {
  console.log(chalk.yellow('[WARN]', ...args));
}
