#!/usr/bin/env node
import yargs from 'yargs';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import sync from './sync';
import init from './init';
import extract from './extract';

yargs // eslint-disable-line
  .usage('$0 <command> [opts..]')
  // allow envvars
  .env('TRANSLATION')
  .demandOption('k', chalk.red('[ERROR] You must provide an API key to communicate with translation.io'))
  // config
  .config('c', (path) => {
    try {
      return JSON.parse(readFileSync(path));
    } catch (e) { /* do nothing */ }
    return {};
  })
  .alias('c', 'config')
  .default('c', `${process.cwd()}/.translaterc`)
  // commands
  .command(
    'init',
    'Start a project out with translation.io',
    () => {},
    argv => init(argv),
  )
  .command(
    ['sync', '*'],
    'Sync your translations - download translated phrases and upload new keys',
    () => {},
    argv => sync(argv),
  )
  .command(
    'extract',
    'Extract your translations into a single hash',
    () => {},
    argv => extract(argv),
  )
  // examples
  .example('$0 init', 'Initialise your project using the data inside of `.translaterc`')
  .example('$0 sync', 'Sync your translations')
  .example('$0 sync -p', 'Sync and purge your translations - remove any superfluous keys')
  // apiKey
  .string('k')
  .alias('k', 'apiKey')
  .describe('k', 'Provide the translation.io API key for your current project')
  // messageKey
  .string('y')
  .alias('y', 'messageKey')
  .describe('y', 'The key your messages are stored under inside your message hashes')
  .default('y', 'defaultMessage')
  // endpoint
  .string('e')
  .alias('e', 'endpoint')
  .describe('e', 'The endpoint to POST to.  Probably not useful outside of debugging.')
  .default('e', 'https://translation.io/api')
  // source locale
  .string('s')
  .alias('s', 'sourceLocale')
  .describe('s', 'The locale your application started in')
  .default('s', 'en')
  // target locales
  .array('t')
  .alias('t', 'targetLocales')
  .describe('t', 'The languages that your application is targetting')
  .default('t', [])
  // app root
  .string('a')
  .alias('a', 'appRoot')
  .describe('a', 'The directory your app is in')
  .default('a', './')
  // translation root
  .string('r')
  .alias('r', 'translationRoot')
  .describe('r', 'The root of your translations.  This will be created if it doesn\'t exist, and does not need to be in source control.')
  .default('r', '<appRoot>/translations')
  // locales root
  .string('l')
  .alias('l', 'localesRoot')
  .describe('l', 'The root of your locales. Probably not especially useful to you.')
  .default('l', '<translationRoot>/gettext')
  // suffix of the translated files
  .string('x')
  .alias('x', 'extenstion')
  .describe('x', 'The extension to use on the translated files')
  .default('x', 'yml')
  // domain
  .string('d')
  .alias('d', 'domain')
  .describe('d', 'The domain of your application. Probably not especially useful to you.')
  .default('d', 'app')
  // potPath
  .string('p')
  .alias('p', 'potPath')
  .describe('p', 'The path to store the POT files. Probably not especially useful to you.')
  .default('p', '<localesRoot>/<domain>.pot')
  // messagesRoot
  .string('m')
  .alias('m', 'messagesRoot')
  .describe('m', 'The root of your messages, as extracted by `react-intl`.')
  .default('m', '<appRoot>/build/messages')
  // messagesGlob
  .string('g')
  .alias('g', 'messagesGlob')
  .describe('g', 'The glob to search for your messages for.  These messages are as extracted from `react-intl`.')
  .default('g', '<messagesRoot>/**/*.json')
  // debug
  .string('v')
  .alias('v', 'debug')
  .describe('v', 'Enable debug logging.')
  .default('v', false)
  // purge
  .string('f')
  .alias('f', 'purge')
  .describe('f', 'Purge keys during sync. This will remove any keys on the translation.io server that don\'t exist locally.')
  .default('f', false)
  // that's all
  .epilog('Copyright © David Buchan-Swanson 2016')
  .help()
  .wrap(Math.min(120, yargs.terminalWidth()))
  .argv;
