/* @flow */

import qs from 'querystring';
import axios from 'axios';
import * as log from './log';
import * as config from './config';
import { potData } from './const';

const attachParams = (data) => ({
  client: 'rails',
  version: '1.14',
  source_language: config.sourceLocale(),
  'target_languages[]': config.targetLocales(),
  pot_data: potData,
  ...data,
});

const instance = axios.create({
  baseURL: 'https://translation.io/api',
});

instance.interceptors.request.use((req) => {
  const params = attachParams(req.data);
  log.verbose(
    `Sending request to ${req.url} with ${JSON.stringify(params, null, 2)}`,
  );
  Object.assign(req, {
    url: `/projects/${config.apiKey()}/${req.url}`,
    data: qs.stringify(params),
  });

  return req;
});

instance.interceptors.response.use(
  (res) => {
    log.verbose(`Received response from ${res.config.url}`);
    log.verbose(`Response: ${JSON.stringify(res.data, null, 2)}`);
    return res;
  },
  (err) => {
    log.error(
      `Error with request to \`${err.config.url}\`: ${
        err.response ? err.response.data : 'No Response'
      }`,
    );
    return err;
  },
);

export const post = (url: string, data: { [string]: mixed }) =>
  instance.post(url, data);

export const get = (url: string) => instance.get(url);
