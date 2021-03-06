/* @flow */

import { join } from 'path';
import { sync } from 'glob';
import mkdirp from 'mkdirp';
import is, { type AssertionType } from 'sarcastic';
import * as util from './util';
import * as config from './config';
import * as log from './log';

const MINIMAL_FORMAT = is.objectOf(is.string);
const JSON_FORMAT = is.arrayOf(
  is.shape({
    id: is.string,
    defaultMessage: is.string,
  }),
);
const LINGUI_FORMAT = is.objectOf(
  is.shape({
    defaults: is.maybe(is.string),
  }),
);

const normalizeId = config.normalizeIds()
  ? (key) =>
      key
        .replace(/[^A-Za-z ]/g, '')
        .replace(/ /g, '.')
        .slice(0, 40)
        .toLowerCase()
  : (k) => k;

const normalizeMessage = config.stripNewlines()
  ? (message) => message.replace(/\n */g, ' ')
  : (m) => m;

// eslint-disable-next-line flowtype/no-weak-types
const normalize: (any, string) => AssertionType<typeof JSON_FORMAT> = (
  json,
  format,
) => {
  switch (format) {
    case 'minimal':
      return Object.keys(is(json, MINIMAL_FORMAT)).map((key) => ({
        id: normalizeId(key),
        // when in `minimal` format, the name of the key in the source is
        // the default message
        defaultMessage: normalizeMessage(key),
      }));
    case 'lingui':
      // eslint-disable-next-line no-case-declarations
      const parsed = is(json, LINGUI_FORMAT);
      return Object.keys(is(json, LINGUI_FORMAT)).map((key) => ({
        id: normalizeId(key),
        defaultMessage: normalizeMessage(parsed[key].defaults || key),
      }));
    case 'json':
    default:
      return is(json, JSON_FORMAT).map(({ id, defaultMessage }) => ({
        id: normalizeId(id),
        defaultMessage: normalizeMessage(defaultMessage),
      }));
  }
};

export const load = (glob: string) => {
  const files: Array<string> = sync(glob);

  const allTranslations = files
    .map((file) => {
      try {
        const content = util.read(file);
        const json = JSON.parse(content);

        return normalize(json, config.format());
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
