/* @flow */

import fs from 'fs';
import deepMkDir from 'mkdirp';
import { dirname } from 'path';
import rimraf from 'rimraf';

export function write(path: string, data: string) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
}

export function read(path: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) return reject(err);
      return resolve(data.toString());
    });
  });
}

export function remove(path: string) {
  return new Promise((resolve, reject) => {
    rimraf(path, (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
}

export function mkdirp(path: string): Promise<void> {
  return new Promise((res, reject) => {
    const p = dirname(path);
    deepMkDir(p, (err, made) => {
      if (err) return reject(err);
      return res(made);
    });
  });
}
