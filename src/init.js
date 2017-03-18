/* @flow */
// perform the init
// this is a CLI method. It does not return.
import { debug, success, log } from './util/debugLog';
import type { Options } from './util/retrieveDefaultConfig';
import defaults from './util/retrieveDefaultConfig';
import { buildPOTFile } from './updatePOTFile';
import { write, mkdirp } from './util/fileOps';
import extractTranslations from './util/extractTranslations';
import createYamlFiles from './util/createYamlFiles';
import createPOFiles from './util/createPOFiles';
import createRequester from './util/request';

export default async function init(options: Options) {
  log('Initializing new translation.io project');
  /**
   * Update the POT file
   */
  const opts = defaults(options);
  if (opts.debug) {
    debug('Loaded options', JSON.stringify(opts, null, 2));
  }
  const req = createRequester(opts);
  await mkdirp(opts.potPath);
  log('Extracting translations...');
  await extractTranslations(
    opts.messagesGlob,
    opts.translationRoot,
    opts.domain,
    opts.sourceLocale,
  );
  success('Translations extracted.');
  log('Building POT file...');
  const potFile = await buildPOTFile(opts.messagesGlob, opts.messageKey);
  success('Built POT File');
  await write(opts.potPath, potFile);
  success('POT file written to', opts.potPath);
  log('Creating YAML Files');
  await createYamlFiles(opts);
  success('Created YAML Files');
  log('Creating PO Files');
  const poFiles = await createPOFiles(opts.messagesGlob, opts.messageKey);
  const params = opts.targetLocales.reduce((param, locale) => ({
    ...param,
    [`yaml_po_data_${locale}`]: poFiles,
  }), {});

  await req.post('/init', params);
  success('Completed init.  You can sync now.');
}
