/* @flow */

type Options = {
  comments?: Array<string>,
  projectVersion?: string,
  creationDate?: boolean|Date,
  charset?: string,
  encoding?: string,
};

export default function POTHeader(options: Options = {}): string {
  let header = '';
  if (options.comments) {
    header += options.comments
      .reduce((comments, comment) => comments.concat(comment.split('\n')), [])
      .map(comment => `# ${comment}`)
      .join('\n')
      .concat('\n');
  }

  header += `msgid ""
msgstr ""
`;

  if (options.projectVersion) {
    header += `"Project-Id-Version: ${options.projectVersion}\\n"\n`;
  }
  if (options.creationDate) {
    const date = options.creationDate instanceof Date ? options.creationDate : new Date();
    header += `"Project-Id-Version: ${date.toISOString()}\\n"\n`;
  }
  if (options.charset) {
    header += `"Content-Type: text/plain; charset=${options.charset}\\n"\n`;
  }
  if (options.encoding) {
    header += `"Content-Transfer-Encoding: ${options.encoding}\\n"\n`;
  }
  header += '"MIME-Version: 1.0\\n"\n';
  header += '"X-Generator: translation.io.js\\n"\n';
  header += '\n\n';

  return header;
}
