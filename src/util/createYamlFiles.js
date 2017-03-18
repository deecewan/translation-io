import type { EnforcedOptions } from './retrieveDefaultConfig';
import { read, write } from './fileOps';

// yaml file paths are the *.json message blocks

export default async function createPOFiles(opts: EnforcedOptions) {
  const defaults = await read(`${opts.translationRoot}/translation.${opts.sourceLocale}.yml`);

  const p = opts.targetLocales.map(tLocale =>
    write(`${opts.translationRoot}/translation.${tLocale}.yml`, defaults),
  );

  return Promise.resolve(p);
}
