import SparqlHandler from '../../src/SparqlHandler';

import { deindent } from '../util';

describe('a SparqlHandler instance', () => {
  let handler;
  beforeAll(() => handler = new SparqlHandler());

  it('errors when an immediate link has no predicate', () => {
    const parent = {};
    const child = { parent, toString: () => 'child' };

    expect(handler.execute(child)).rejects
      .toThrow(new Error('Expected predicate in child'));
  });

  it('errors when a root has no subject', () => {
    const parent = { toString: () => 'root' };
    const child = { parent, predicate: 'foo' };

    expect(handler.execute(child)).rejects
      .toThrow(new Error('Expected root subject in root'));
  });

  it('errors with a path of length 0', () => {
    const path = { subject: 'https://example.org/#me' };

    expect(handler.execute(path)).rejects
      .toThrow(new Error('Path should at least contain a subject and a predicate'));
  });

  it('resolves a path of length 1', async () => {
    const path = { subject: 'https://example.org/#me' };
    const first = { parent: path, predicate: 'https://example.org/p1' };

    expect(await handler.execute(first)).toEqual(deindent(`
      SELECT ?result WHERE {
        <https://example.org/#me> <https://example.org/p1> ?result.
      }`));
  });

  it('resolves a path of length 2', async () => {
    const path = { subject: 'https://example.org/#me' };
    const first = { parent: path, predicate: 'https://example.org/p1' };
    const second = { parent: first, predicate: 'https://example.org/p2' };

    expect(await handler.execute(second)).toEqual(deindent(`
      SELECT ?result WHERE {
        <https://example.org/#me> <https://example.org/p1> ?v0.
        ?v0 <https://example.org/p2> ?result.
      }`));
  });

  it('resolves a path of length 3', async () => {
    const path = { subject: 'https://example.org/#me' };
    const first = { parent: path, predicate: 'https://example.org/p1' };
    const second = { parent: first, predicate: 'https://example.org/p2' };
    const third = { parent: second, predicate: 'https://example.org/p3' };

    expect(await handler.execute(third)).toEqual(deindent(`
      SELECT ?result WHERE {
        <https://example.org/#me> <https://example.org/p1> ?v0.
        ?v0 <https://example.org/p2> ?v1.
        ?v1 <https://example.org/p3> ?result.
      }`));
  });
});
