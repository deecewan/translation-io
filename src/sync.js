/* @flow */

import { join } from 'path';
import is from 'sarcastic';
import { load } from './extract';
import * as config from './config';
import * as log from './log';
import * as req from './request';
import * as util from './util';

const SOURCE_EDITS = is.arrayOf(
  is.shape({
    key: is.string,
    old_text: is.string,
    new_text: is.string,
  }),
);

export default async () => {
  log.info('Running `sync`.');

  // ApplyYamlSourceEditsStep

  log.info('Retrieving source edits...');
  const sourceEdits = await req
    .post('/source_edits', {
      timestamp: util.timestamp(),
    })
    .then((res) => is(res.data.source_edits, SOURCE_EDITS, 'source_edits'));

  if (sourceEdits.length > 0) {
    log.warn('Source has been edited on `translation.io`.');
    log.warn(
      "This is not currently supported - you'll need to manually update the keys.",
    );
    sourceEdits.forEach((edit) => {
      log.warn(
        `  Changed \`${edit.key}\`: Replace '${edit.old_text}' with '${
          edit.new_text
        }'`,
      );
    });
    log.warn(
      'You can ignore any of these that have already been updated locally',
    );
  }
  log.info('Source edits retreived.');

  // CreateYamlPotFileStep

  log.info('Loading translations from disk...');
  const translations = load(config.messages());
  log.info('Translations loaded.');

  log.info('Writing translation file for source locale.');
  util.write(
    join(config.output(), `translation.${config.sourceLocale()}.json`),
    JSON.stringify(translations, null, 2),
  );

  log.info('Generating PO data for translations...');
  const potData = util.poGenerator(translations);
  log.info('PO data generated.');

  log.info('Syncing data with `translation.io`...');
  const data = await req
    .post('/sync', {
      yaml_pot_data: potData,
      timestamp: util.timestamp(),
    })
    .then((res) => res.data);
  log.info('Retrieved data from `translation.io`.');

  if (data.unused_segments) {
    const unusedSegments = is(
      data.unused_segments,
      is.arrayOf(
        is.shape({
          msgctxt: is.string,
          msgid: is.string,
        }),
      ),
      'unused_segments',
    );

    if (unusedSegments.length > 0) {
      log.warn(
        "You have unused segments. You should make sure these aren't used anywhere else before you remove them.",
      );
      unusedSegments.forEach((seg) => {
        log.warn(`  - \`${seg.msgctxt}\` ('${seg.msgid}') is unused.`);
      });
    }
  }

  log.info('Writing received translations to disk...');
  config.targetLocales().forEach((locale) => {
    const poData = data[`yaml_po_data_${locale}`];
    if (typeof poData !== 'string') {
      log.warn(`Didn't get any translations from the server for ${locale}.`);
      return;
    }
    util.write(
      join(config.output(), `translation.${locale}.json`),
      JSON.stringify(util.parsePoData(poData), null, 2),
    );
  });
  log.info('Translations written do disk.');

  log.success('Successfully completed sync.');
};
