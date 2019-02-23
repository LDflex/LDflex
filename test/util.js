export function deindent(string) {
  const first = (/^ +/m).exec(string)[0];
  const indent = !first ? /^/ : new RegExp(`^ {${first.length}}?`, 'mg');
  return string.trim().replace(indent, '');
}

export function createQueryEngine(results) {
  return {
    execute: jest.fn(async function*() {
      for (const term of results)
        yield new Map([['?value', term]]);
    }),
  };
}
