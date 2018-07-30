/* @flow */

import program from '@deecewan/commander';
import pkg from '../package.json';

type Subcommand = 'sync' | 'init' | 'extract';

type Args = {
  command: Subcommand,
  config: ?string,
  quiet: boolean,
  verbose: number,
};

const increaseVerbosity = (v, total) => total + 1;

const res = program
  .version(pkg.version, '-v, --version')
  .option('-V, --verbose', 'Enable verbose mode', increaseVerbosity, 0)
  .option('-q, --quiet', 'Disable all output')
  .option('-c, --config', 'The config file to use')
  .command('sync', 'Sync translations')
  .option('-p, --purge', 'Purge when syncing keys')
  .command('init', 'Init the translation.io project')
  .command('extract', 'Extract translations from your local files')
  .parse(process.argv);

const args: Args = {
  verbose: res.verbose || 0,
  quiet: res.quiet || false,
  config: res.config || null,
  command: res.command,
};

export default args;
