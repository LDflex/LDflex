import SparqlHandler from '../../src/SparqlHandler';

import { deindent } from '../util';

describe('a SparqlHandler instance', () => {
  let handler;
  beforeAll(() => handler = new SparqlHandler());

  it('errors when no pathExpression is present', async () => {
    const path = { toString: () => 'path' };

    await expect(handler.execute(path, {})).rejects
      .toThrow(new Error('path has no pathExpression property'));
  });

  it('errors with a path of length 0', async () => {
    const pathExpression = [
      { subject: 'https://example.org/#me' },
    ];
    const path = { toString: () => 'path' };

    await expect(handler.execute(path, { pathExpression })).rejects
      .toThrow(new Error('path should at least contain a subject and a predicate'));
  });

  it('resolves a path of length 1', async () => {
    const pathExpression = [
      { subject: 'https://example.org/#me' },
      { predicate: 'https://ex.org/p1' },
    ];
    const path = { property: 'p1' };

    expect(await handler.execute(path, { pathExpression })).toEqual(deindent(`
      SELECT ?p1 WHERE {
        <https://example.org/#me> <https://ex.org/p1> ?p1.
      }`));
  });

  it('resolves a path of length 3', async () => {
    const pathExpression = [
      { subject: 'https://example.org/#me' },
      { predicate: 'https://ex.org/p1' },
      { predicate: 'https://ex.org/p2' },
      { predicate: 'https://ex.org/p3' },
    ];
    const path = { property: 'p3' };

    expect(await handler.execute(path, { pathExpression })).toEqual(deindent(`
      SELECT ?p3 WHERE {
        <https://example.org/#me> <https://ex.org/p1> ?v0.
        ?v0 <https://ex.org/p2> ?v1.
        ?v1 <https://ex.org/p3> ?p3.
      }`));
  });

  it('resolves a path with an property name ending in a non-word', async () => {
    const pathExpression = [
      { subject: 'https://example.org/#me' },
      { predicate: 'https://ex.org/p1' },
    ];
    const path = { property: '/x/' };

    expect(await handler.execute(path, { pathExpression })).toEqual(deindent(`
      SELECT ?result WHERE {
        <https://example.org/#me> <https://ex.org/p1> ?result.
      }`));
  });
});
