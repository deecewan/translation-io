/* @flow */

import { join } from 'path';
import { sync } from 'glob';
import is from 'sarcastic';
import intersection from 'lodash.intersection';
import * as util from './util';
import * as config from './config';
import * as log from './log';

export const load = (glob: string) => {
  const files: Array<string> = sync(glob);

  return files
    .map((file) => {
      try {
        const content = util.read(file);
        const json = JSON.parse(content);

        return is(json, is.objectOf(is.string), file);
      } catch (e) {
        log.error(`Error extracting JSON from \`${file}\`: ${e.message}`);
        throw e;
      }
    })
    .reduce((acc, curr) => {
      const int: Array<string> = intersection(
        Object.keys(acc),
        Object.keys(curr),
      );
      int.forEach((duplicate) => {
        log.warn(`Duplicate translation keys: ${duplicate}.`);
      });

      return { ...acc, ...curr };
    }, {});
};

export default () => {
  log.info('Running `extract`.');
  log.info('Extracting translations...');
  const translations = JSON.stringify(load(config.messages()), null, 2);
  log.info('Translations extracted.');

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
