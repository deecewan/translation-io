/* @flow */

import type { Options } from './util/retrieveDefaultConfig';
import { debug, success, log, warn } from './util/debugLog';
import defaults from './util/retrieveDefaultConfig';
import extractTranslations from './util/extractTranslations';
import createRequester from './util/request';
import parse from './util/parsePO';

export default async function sync(options: Options): Promise<void> {
  log('Setting everything up...');
  const opts = defaults(options);
  await mkdirp(opts.potPath);
  if (opts.debug) {
    debug('Loaded options', JSON.stringify(opts, null, 2));
  }
  const req = createRequester(opts);
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
