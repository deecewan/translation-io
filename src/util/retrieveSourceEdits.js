/* @flow */

import type { EnforcedOptions } from './retrieveDefaultConfig';
import reqMaker from './request';

export default async function retrieveSourceEdits(opts: EnforcedOptions) {
  const req = reqMaker(opts);
  const res = await req.post('/source_edits');
  return res.data.source_edits;
}
