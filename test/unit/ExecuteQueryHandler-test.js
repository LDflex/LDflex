import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';

describe('a ExecuteQueryHandler instance', () => {
  describe('in multi-element mode', () => {
    let handler;
    beforeAll(() => handler = new ExecuteQueryHandler());

    it('errors when a path defines no query engine', async () => {
      const path = { settings: {}, toString: () => 'path' };
      const iterator = handler.execute(path, {})();
      await expect(iterator.next()).rejects
        .toThrow(new Error('path has no queryEngine setting'));
    });

    it('errors when a path defines no sparql property', async () => {
      const path = { settings: { queryEngine: {} }, toString: () => 'path' };
      const iterator = handler.execute(path, {})();
      await expect(iterator.next()).rejects
        .toThrow(new Error('path has no sparql property'));
    });

    it('errors with multi-variable results', async () => {
      const bindings = new Map([['?a', ''], ['?b', '']]);
      await expect(() => handler.extractTerm(bindings))
        .toThrow(new Error('Only single-variable queries are supported'));
    });
  });

  describe('in single-element mode', () => {
    let handler;
    beforeAll(() => handler = new ExecuteQueryHandler({ single: true }));

    it('errors when a path defines no query engine', async () => {
      const path = { settings: {}, toString: () => 'path' };
      const thenable = { then: handler.execute(path, {}) };
      await expect(thenable).rejects
        .toThrow(new Error('path has no queryEngine setting'));
    });
  });
});
