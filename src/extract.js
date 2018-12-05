/* @flow */

import { join } from 'path';
import { sync } from 'glob';
import mkdirp from 'mkdirp';
import is from 'sarcastic';
import * as util from './util';
import * as config from './config';
import * as log from './log';

export const load = (glob: string) => {
  const files: Array<string> = sync(glob);

  const allTranslations = files
    .map((file) => {
      try {
        const content = util.read(file);
        const json = JSON.parse(content);

        return is(
          json,
          is.arrayOf(
            is.shape({
              id: is.string,
              defaultMessage: is.string,
            }),
          ),
          file,
        );
      } catch (e) {
        log.error(`Error extracting JSON from \`${file}\`: ${e.message}`);
        throw e;
      }
    })
    .reduce((acc, curr) => [...acc, ...curr], []);

  const obj = {};
  let error = false;
  allTranslations.forEach((t) => {
    if (obj[t.id] !== undefined) {
      log.warn(`Duplicate translation keys: ${t.id}.`);
    }
    if (t.defaultMessage.includes('\n')) {
      log.error(
        'Translations should not contain newlines. Please remove the newline.',
      );
      log.error(`  \`${t.id}\` ("${t.defaultMessage}")`);
      error = true;
    }
    obj[t.id] = t.defaultMessage;
  });
  if (error) {
    log.error('Stopping due to errors');
    process.exit(1);
  }
  return obj;
};

export default () => {
  log.info('Running `extract`.');
  log.info('Extracting translations...');
  const translations = JSON.stringify(load(config.messages()), null, 2);
  log.info('Translations extracted.');

  log.info('Ensuring that the output directory exists...');
  mkdirp.sync(config.output());
  log.info('Output directory exists.');

  log.info('Writing translation files...');
  config
    .locales()
    .map((locale) => join(config.output(), `translation.${locale}.json`))
    .forEach((file) => {
      log.verbose(`Writing \`${file}\`...`);
      util.write(file, translations);
      log.verbose(`Completed writing \`${file}\`.`);
    });
  log.info('Wrote all translation files.');
  log.info('Completed `extract`.');
  log.success('Successfully extracted translations.');
};
