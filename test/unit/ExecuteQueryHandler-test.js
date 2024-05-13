import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';
import { literal } from '@rdfjs/data-model';
import { iterableToArray } from '../../src/iterableUtils';

describe('a ExecuteQueryHandler instance', () => {
  let handler;
  beforeAll(() => {
    handler = new ExecuteQueryHandler();
  });

  it('errors when a path defines no query engine', async () => {
    const pathData = { settings: {}, toString: () => 'path' };
    const iterable = handler.handle(pathData, {});
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).rejects
      .toThrow(new Error('path has no queryEngine setting'));
  });

  it('errors when a path defines no sparql property', async () => {
    const pathData = { settings: { queryEngine: {} }, toString: () => 'path' };
    const iterable = handler.handle(pathData, {});
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).rejects
      .toThrow(new Error('path has no sparql property'));
  });

  it('errors with multi-variable results', async () => {
    const bindings = new Map([['?a', literal('')], ['?b', literal('')]]);
    const pathData = { extendPath: args => args };
    await expect(() => handler.extractTerm(bindings, pathData))
      .toThrow(new Error('Only single-variable queries are supported'));
  });

  it('tries the result cache before executing a query', async () => {
    const cache = [
      { subject: {} },
      { subject: {} },
    ];
    const resultsCache = Promise.resolve(cache);
    const results = handler.handle({ resultsCache });
    expect(await iterableToArray(results)).toEqual(cache);
  });

  it('immediately returns if there is an empty query', async () => {
    const pathData = { settings: { queryEngine: { execute: () => [new Map([['?a', 'b']])] } }, toString: () => 'path' };
    const iterable = handler.handle(pathData, { sparql: '' });
    const iterator = iterable[Symbol.asyncIterator]();
    await expect((await iterator.next()).value).toEqual(undefined);
  });
});
