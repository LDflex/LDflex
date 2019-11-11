import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';
import { literal } from '@rdfjs/data-model';

describe('a ExecuteQueryHandler instance', () => {
  let handler;
  beforeAll(() => handler = new ExecuteQueryHandler());

  it('errors when a path defines no query engine', async () => {
    const path = { settings: {}, toString: () => 'path' };
    const iterable = handler.handle(path, {});
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).rejects
      .toThrow(new Error('path has no queryEngine setting'));
  });

  it('errors when a path defines no sparql property', async () => {
    const path = { settings: { queryEngine: {} }, toString: () => 'path' };
    const iterable = handler.handle(path, {});
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).rejects
      .toThrow(new Error('path has no sparql property'));
  });

  it('errors with multi-variable results', async () => {
    const bindings = new Map([['?a', literal('')], ['?b', literal('')]]);
    const path = { extendPath: args => args };
    await expect(() => handler.extractTerm(bindings, path))
      .toThrow(new Error('Only single-variable queries are supported'));
  });
});
