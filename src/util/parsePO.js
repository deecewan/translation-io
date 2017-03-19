/* @flow */

function getMatch(line) {
  return line.match(/^(msg(id|ctxt|str))/);
}

export default function parse(po: string): Object {
  const blocks = po.split('\n\n');
  const results = blocks.map((block) => {
    const lines = block.split('\n').filter(line => line.indexOf('#') !== 0);

    const obj = {};
    let currentToken = '';
    let currentResult = [];

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const match = getMatch(line);
      if (match) {
        currentToken = match[0];
        currentResult.push(line.replace(/"/g, '').replace(currentToken, '').trim());
        for (let j = i + 1; j < lines.length; j += 1) {
          const l = lines[j];
          if (getMatch(l)) {
            i = j - 1;
            break;
          }
          currentResult.push(l.replace(/"/g, '').trim());
        }
        obj[currentToken] = currentResult.join(' ');
        currentResult = [];
      }
    }
    return obj;
  });

  return results.map(({ msgctxt, msgstr, msgid }) => {
    const str = msgstr !== '' ? msgstr : msgid;
    return {
      [msgctxt]: str,
    };
  }).reduce((p, c) => ({ ...p, ...c }));
}
