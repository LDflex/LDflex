export function deindent(string) {
  return string.trim().replace(/^ {6}?/mg, '');
}

export function createQueryEngine(results) {
  return {
    execute: jest.fn(() => {
      const values = results.map(value => ({ value }));
      return {
        next: async () => ({
          done: values.length === 0,
          value: new Map([['?value', values.shift()]]),
        }),
      };
    }),
  };
}
