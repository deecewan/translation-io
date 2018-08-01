/* @flow */

import chalk from 'chalk';
import args from './args';

const debugEnabled = () => {
  const env = process.env.TRANSLATION_IO_DEBUG;
  if (env == null) {
    return false;
  }

  return env !== 'false' && env !== '0';
};

const shouldPrint = () => !args.quiet && (args.verbose > 0 || debugEnabled());

export const verbose = (...str: Array<string>) =>
  shouldPrint && args.verbose > 1
    ? console.log(chalk.magenta(...str)) // eslint-disable-line no-console
    : undefined;

export const info = (...str: Array<string>) =>
  // eslint-disable-next-line no-console
  shouldPrint() ? console.log(chalk.cyan(...str)) : undefined;

const print = (fn) => (str: string) =>
  // eslint-disable-next-line no-console
  args.quiet ? undefined : console.log(fn(str));

export const success = print(chalk.green);
export const warn = print(chalk.yellow);
export const error = print(chalk.red);
