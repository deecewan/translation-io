/* @flow */

import { readFile as nativeReadFile } from 'fs';
import glob from 'glob';
import mergeWith from 'lodash.mergewith';
import createPOTHeader from './util/createPOTHeader';
import POTEntry from './util/POTEntry';

function readFile(location: string): Promise<Object> {
  return new Promise((resolve, reject) => {
    nativeReadFile(location, (err, data) => {
      if (err) { return reject(err); }
      return resolve({ location, messages: data.toString() });
    });
  });
}

function createKeyCombiner(key) {
  return function combineKeys({ location, messages }) {
    const x = messages.reduce((p, c) => ({
      ...p,
      [c[key]]: p[c[key]] ? p[c[key]].concat([{ ...c, location }]) : [{ ...c, location }],
    }), {});
    return x;
  };
}

function customizer(accValue, objectValue) {
  if (!Array.isArray(accValue)) return objectValue;

  return accValue.concat(objectValue);
}

type Entries = [string, mixed];

export function generatePOTEntries(globLocation: string, messageKey?: string = 'defaultMessage'): Promise<{[key: string]: Array<POTEntry>}> {
  return new Promise((resolve, reject) => {
    glob(globLocation, async (err, files) => {
      const rawFiles = await Promise.all(files.map(readFile));
      const res: {[key: string]: Array<*>} = rawFiles
        .map(({ location, messages }) => ({ location, messages: JSON.parse(messages) }))
        .map(createKeyCombiner(messageKey))
        .reduce((p, c) => mergeWith(p, c, customizer), {});
      const mapped = Object.entries(res)
        .map(([key, val]: Entries) => {
          if (!(val instanceof Array)) {
            return reject(new Error(`This is broken ${JSON.stringify(val)}`));
          }
          const vals = val.map(message => new POTEntry(message));
          return { [key]: vals };
        })
        .reduce((p, c) => ({ ...p, ...c }));
      return resolve(mapped);
    });
  });
}

export type Options = { headers?: {[headerName: string]: any }}

export async function buildPOTFile(globLocation: string, messageKey?: string = 'defaultMessage', options?: Options = {}): Promise<string> {
  const potEntries = await generatePOTEntries(globLocation, messageKey);
  const printedEntries = Object.values(potEntries).map((entry) => {
    if (!(entry instanceof Array)) {
      throw new Error('Broken');
    }
    return entry.map((potEntry) => {
      if (!(potEntry instanceof POTEntry)) {
        throw new Error('Broken');
      }
      return potEntry.print();
    });
  });

  return createPOTHeader(options.headers)
    .concat(printedEntries.join(''));
}
