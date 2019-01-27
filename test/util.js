export function deindent(string) {
  return string.trim().replace(/^ {6}?/mg, '');
}

export function createQueryEngine(results) {
  return {
    execute: jest.fn(async function*() {
      for (const term of results)
        yield new Map([['?value', term]]);
    }),
  };
}
