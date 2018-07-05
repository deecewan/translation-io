/* @flow */

import mkdirp from 'mkdirp';
import type { Options } from './util/retrieveDefaultConfig';
import { debug, success, log } from './util/debugLog';
import defaults from './util/retrieveDefaultConfig';
import extractTranslations from './util/extractTranslations';

export default async function sync(options: Options): Promise<void> {
  log('Setting everything up...');
  const opts = defaults(options);
  await mkdirp(opts.potPath);
  if (opts.debug) {
    debug('Loaded options', JSON.stringify(opts, null, 2));
  }
  success('Setup Complete.');
  log('Extracting new translations...');
  await extractTranslations(
    opts.messagesGlob,
    opts.translationRoot,
    opts.domain,
    opts.sourceLocale,
    opts.extension,
  );

  success('Translations extracted.');
}
