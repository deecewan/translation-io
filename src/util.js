/* @flow */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

export const poGenerator = (obj: { [string]: string }) =>
  Object.keys(obj)
    .map((key) => `msgctxt "${key}"\nmsgid "${obj[key]}"\nmsgstr ""\n`)
    .join('\n');

export const parsePoData = (data: string) => {
  const split = data.split('\n\n');

  const parsed = split.map((chunk) => {
    const item = { msgctxt: '', msgid: '', msgstr: '' };
    chunk.split('\n').forEach((line) => {
      const res = line.match(/^(\w+) "(.*)"$/);
      if (res) {
        const [, key, value] = res;
        item[key] = value;
      }
    });

    return item;
  });

  return parsed
    .map((item) => ({ [item.msgctxt]: item.msgstr || item.msgid }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});
};

export const read = (file: string) => readFileSync(file, 'utf8');
export const write = (file: string, content: string) =>
  writeFileSync(file, content, { encoding: 'utf8' });

export const timestamp = () => {
  const res = execSync('git log --format=%ct -n 1', {
    encoding: 'utf8',
  }).trim();

  return parseInt(res, 10);
};
