import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';

describe('a ExecuteQueryHandler instance', () => {
  describe('in multi-element mode', () => {
    let handler;
    beforeAll(() => handler = new ExecuteQueryHandler());

    it('errors when a path defines no query engine', () => {
      const path = { settings: {}, toString: () => 'path' };
      const iterator = handler.execute(path)();
      expect(iterator.next()).rejects
        .toThrow(new Error('No query engine defined in path'));
    });

    it('errors with multi-variable results', () => {
      const bindings = new Map([['?a', ''], ['?b', '']]);
      expect(() => handler.extractTerm(bindings))
        .toThrow(new Error('Only single-variable queries are supported'));
    });
  });

  describe('in single-element mode', () => {
    let handler;
    beforeAll(() => handler = new ExecuteQueryHandler({ single: true }));

    it('errors when a path defines no query engine', () => {
      const path = { settings: {}, toString: () => 'path' };
      const thenable = { then: handler.execute(path) };
      expect(thenable).rejects.toThrow(new Error('No query engine defined in path'));
    });
  });
});
