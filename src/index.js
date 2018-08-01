#!/usr/bin/env node
/* @flow */

import args from './args';
import sync from './sync';
import init from './init';
import extract from './extract';

switch (args.command) {
  case 'sync':
    sync();
    break;
  case 'init':
    init();
    break;
  case 'extract':
    extract();
    break;
  default:
    break;
}
