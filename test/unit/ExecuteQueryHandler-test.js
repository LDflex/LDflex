import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';

describe('a ExecuteQueryHandler instance', () => {
  describe('in multi-element mode', () => {
    let handler;
    beforeAll(() => handler = new ExecuteQueryHandler());

    it('errors when a path defines no query engine', async () => {
      const path = { settings: {}, toString: () => 'path' };
      const iterable = handler.execute(path, {});
      const iterator = iterable[Symbol.asyncIterator]();
      await expect(iterator.next()).rejects
        .toThrow(new Error('path has no queryEngine setting'));
    });

    it('errors when a path defines no sparql property', async () => {
      const path = { settings: { queryEngine: {} }, toString: () => 'path' };
      const iterable = handler.execute(path, {});
      const iterator = iterable[Symbol.asyncIterator]();
      await expect(iterator.next()).rejects
        .toThrow(new Error('path has no sparql property'));
    });

    it('errors with multi-variable results', async () => {
      const bindings = new Map([['?a', ''], ['?b', '']]);
      await expect(() => handler.extractTerm(bindings))
        .toThrow(new Error('Only single-variable queries are supported'));
    });
  });
});
