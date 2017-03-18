/* @flow */
import POEntry from './POTEntry';
import { generatePOTEntries } from '../updatePOTFile';

export default async function createPOFiles(
  messageGlob: string,
  messageKey: string,
): Promise<string> {
  const messages = await generatePOTEntries(messageGlob, messageKey);
  return Object.values(messages).map((entry) => {
    if (!(entry instanceof Array)) {
      throw new Error('Broken');
    }
    return entry.map((pot) => {
      if (!(pot instanceof POEntry)) {
        throw new Error('broken');
      }
      return pot.withContext.print();
    }).join('\n');
  }).join('\n');
}
