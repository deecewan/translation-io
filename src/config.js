/* @flow */

import { readFileSync } from 'fs';
import { join } from 'path';
import is, { type AssertionType } from 'sarcastic';
import args from './args';

const CONFIG_SHAPE = is.shape({
  apiKey: is.string,
  messages: is.string,
  sourceLocale: is.string,
  targetLocales: is.arrayOf(is.string),
  output: is.string,
  // one of 'json' | 'minimal' | 'lingui'
  format: is.default(is.string, 'json'),
  // allow message ids to be created automatically (for Lingui)
  normalizeIds: is.default(is.boolean, false),
  // strip newlines - they are problematic for t.io, so we can remove them
  stripNewlines: is.default(is.boolean, false),
});

type Config = AssertionType<typeof CONFIG_SHAPE>;

let config: ?Config = null;

const parse: (string) => Config = (json) =>
  is(JSON.parse(json), CONFIG_SHAPE, 'Config');

const load = () => {
  const configPath = args.config || join(process.cwd(), '.translaterc.json');

  const file = readFileSync(configPath, 'utf8');
  return parse(file);
};

const get = () => {
  if (config) {
    return config;
  }

  config = load();
  return config;
};

export const apiKey = () => get().apiKey;
export const messages = () => get().messages;
export const sourceLocale = () => get().sourceLocale;
export const targetLocales = () => get().targetLocales;
export const output = () => get().output;
export const locales = () => get().targetLocales.concat(get().sourceLocale);
export const format = () => get().format;
export const normalizeIds = () => get().normalizeIds;
export const stripNewlines = () => get().stripNewlines;
