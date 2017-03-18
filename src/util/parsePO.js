/* @flow */

function parsePiece(piece) {
  const x = piece.split('"');
  return {
    [x[0].trim()]: x[1],
  };
}

export default function parse(po: string): Object {
  const pieces = po.split('\n').filter(piece => piece.indexOf('#') !== 0);

  let currentResult = [];
  const results = [];

  pieces.forEach((piece) => {
    if (piece === '') {
      results.push(currentResult);
      currentResult = [];
    } else {
      currentResult.push(piece);
    }
  });

  return results.map(result =>
    result.map(parsePiece)
    .reduce((p, c) => ({ ...p, ...c }), {}),
  ).map(({ msgctxt, msgstr, msgid }) => {
    const str = msgstr !== '' ? msgstr : msgid;
    return {
      [msgctxt]: str,
    };
  }).reduce((p, c) => ({ ...p, ...c }));
}
