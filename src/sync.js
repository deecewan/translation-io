/* @flow */

import type { Options } from './util/retrieveDefaultConfig';
import { debug, success, log, warn } from './util/debugLog';
import defaults from './util/retrieveDefaultConfig';
import { buildPOTFile } from './updatePOTFile';
import { write, remove, mkdirp } from './util/fileOps';
import extractTranslations from './util/extractTranslations';
import createRequester from './util/request';
import retrieveSourceEdits from './util/retrieveSourceEdits';
import createPOFiles from './util/createPOFiles';
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
  log('Retrieving changes from the server');
  const sourceEdits = await retrieveSourceEdits(opts);
  if (sourceEdits.length > 0) {
    warn('Source edits not empty????????', sourceEdits);
  }
  success('Translation changes received');
  log('Updating POT File...');
  const potFile = await buildPOTFile(opts.messagesGlob, opts.messageKey);
  await write(opts.potPath, potFile);
  success('POT file written');
  log('Creating contextual POT file...');
  const poFiles = await createPOFiles(opts.messagesGlob, opts.messageKey);
  success('Retrieved context POT file.');
  const params = {
    yaml_pot_data: poFiles,
    purge: opts.purge,
  };
  log('Retrieving sync changes...');
  const res = await req.post('/sync', params);
  const writeOps = Object.keys(res.data)
    .filter(key => /yaml_po_data/.test(key))
    .map(key => ({ key, data: res.data[key] }))
    .map(item => ({ file: item.key.replace('yaml_po_data_', 'translation.').concat(`.${opts.extension}`), data: parse(item.data) }))
    .map(item => write(`${opts.translationRoot}/${item.file}`, JSON.stringify(item.data, null, 2)));

  await Promise.all(writeOps);
  await remove(opts.localesRoot);
  success('Successfully synced translations');
}
