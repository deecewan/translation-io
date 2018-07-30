/* @flow */

import { join } from 'path';
import is from 'sarcastic';
import * as log from './log';
import * as req from './request';
import * as util from './util';
import * as config from './config';
import { load } from './extract';

const RESPONSE_SHAPE = is.shape({
  project_name: is.string,
  project_url: is.string,
});

export default () => {
  log.info('Running `init`.');
  log.info('Loading translations from disk...');
  const translations = load(config.messages());
  log.info('Translations loaded.');

  log.info('Generating PO data for translations...');
  const potData = util.poGenerator(translations);

  const params = config
    .targetLocales()
    .map((locale) => ({ [`yaml_po_data_${locale}`]: potData }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});
  log.info('PO data generated.');

  log.info('Posting payload to `translation.io/init`');
  req
    .post('/init', params)
    .then((res) => {
      log.info('Request made. Processing...');
      const { data } = res;
      const knownData = is(data, RESPONSE_SHAPE, 'init_response');

      log.info('Writing received translations to disk...');
      // now we need to save the data that has come back
      const object = is(data, is.objectOf(is.string), 'init_response');

      config.targetLocales().forEach((locale) => {
        const poData = object[`yaml_po_data_${locale}`];
        if (poData) {
          util.write(
            join(config.output(), `translation.${locale}.json`),
            JSON.stringify(util.parsePoData(poData), null, 2),
          );
        }
      });
      log.info('Written translations to disk.');

      log.success(
        `Successfully initialised project \`${knownData.project_name}\` at ${
          knownData.project_url
        }`,
      );
    })
    .catch(() => {
      log.error('Failed to initialize project');
    });
};
