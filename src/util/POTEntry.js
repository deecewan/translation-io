import { relative } from 'path';

export default class POTEntry {

  static wrapMultiline = (commentPrefix, rawComment) =>
    rawComment.split('\n')
    .reduce((p, c) => `${p}${commentPrefix} ${c}\n`, '')
    .slice(0, -1);

  constructor(message) {
    this.filename = message.location;
    this.id = message.id;
    this.description = message.description;
    this.defaultMessage = message.defaultMessage;
  }

  get withContext() {
    this.context = true;
    return this;
  }

  print() {
    const ctx = this.context;
    this.context = false;
    return `
${POTEntry.wrapMultiline('#:', relative(process.cwd(), this.filename))}
${POTEntry.wrapMultiline(
  '#.',
  this.description ? `[${this.id}] - ${this.description}` : `[${this.id}]`,
)}
${POTEntry.wrapMultiline('#.', `Default message is: ${this.defaultMessage}`)}
`.concat(ctx ? `msgctxt "${this.id}"
` : '')
.concat(`msgid ${JSON.stringify(this.defaultMessage)}
msgstr ""
`);
  }
}
