/* @flow */

import program from '@deecewan/commander';
import pkg from '../package.json';

type Subcommand = 'sync' | 'init' | 'extract';

type Args = {
  command: Subcommand,
  config: ?string,
  purge: boolean,
  quiet: boolean,
  readonly: boolean,
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
  .option(
    '-r, --readonly',
    'Only pull translations (do not push local translations)',
  )
  .command('init', 'Init the translation.io project')
  .command('extract', 'Extract translations from your local files')
  .parse(process.argv);

const args: Args = {
  command: res.command,
  config: res.config || null,
  purge: res.purge || false,
  quiet: res.quiet || false,
  readonly: res.readonly || false,
  verbose: res.verbose || 0,
};

export default args;
