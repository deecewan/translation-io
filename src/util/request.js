import axios from 'axios';
import qs from 'querystring';
import { debug, warn } from './debugLog';
import * as consts from './consts';

const endpoint = 'https://translation.io/api';

function createTimestamp() {
  return Math.floor(Date.now() / 1000);
}

export default function getInstance(opts) {
  if (opts.debug) {
    debug('Creating `axios` instance', JSON.stringify(opts, null, 2));
  }
  const instance = axios.create({
    baseURL: `${endpoint}/projects/${opts.apiKey}`,
  });

  instance.interceptors.request.use((config) => {
    if (opts.debug) {
      debug('Sending config to server', config);
    }
    return {
      ...config,
      data: qs.stringify({
        ...config.data,
        source_language: opts.sourceLocale,
        'target_languages[]': opts.targetLocales,
        gem_version: consts.GEM_VERSION,
        timestamp: createTimestamp(),
        pot_data: consts.POT_DATA,
      }),
    };
  });

  instance.interceptors.response.use((res) => {
    if (opts.debug) {
      debug('Response received', res);
    }
    return res;
  }, (err) => {
    warn('Error from the server', err);
    return Promise.reject(err);
  });

  return instance;
}
