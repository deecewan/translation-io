/* @flow */

import glob from 'glob';
import fs from 'fs';
import { write } from './fileOps';
import hasProp from './hasProp';

export default function extractTranslations(
  messageGlob: string,
  translationRoot: string,
  domain: string,
  sourceLocale: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    glob(messageGlob, (err, files) => {
      if (err) { return reject(err); }

      const defaults = files
        .map(file => fs.readFileSync(file, 'utf8'))
        .map(file => JSON.parse(file))
        .reduce((c, d) => {
          d.forEach(({ id, defaultMessage }) => {
            if (hasProp(c, id)) {
              throw new Error(`Duplicate message id! ${id}: ${defaultMessage}`);
            }
            c[id] = defaultMessage; // eslint-disable-line
          });

          return c;
        }, {});

      return write(`${translationRoot}/translation.${sourceLocale}.yml`, JSON.stringify(defaults, null, 2))
        .then(() => resolve());
    });
  });
}
