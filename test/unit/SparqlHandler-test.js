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
    const first = { parent: path, property: 'p1', predicate: 'https://ex.org/p1' };

    expect(await handler.execute(first)).toEqual(deindent(`
      SELECT ?p1 WHERE {
        <https://example.org/#me> <https://ex.org/p1> ?p1.
      }`));
  });

  it('resolves a path of length 2', async () => {
    const path = { subject: 'https://example.org/#me' };
    const first = { parent: path, property: 'p1', predicate: 'https://ex.org/p1' };
    const second = { parent: first, property: 'p2', predicate: 'https://ex.org/p2' };

    expect(await handler.execute(second)).toEqual(deindent(`
      SELECT ?p2 WHERE {
        <https://example.org/#me> <https://ex.org/p1> ?v0.
        ?v0 <https://ex.org/p2> ?p2.
      }`));
  });

  it('resolves a path of length 3', async () => {
    const path = { subject: 'https://example.org/#me' };
    const first = { parent: path, property: 'p1', predicate: 'https://ex.org/p1' };
    const second = { parent: first, property: 'p2', predicate: 'https://ex.org/p2' };
    const third = { parent: second, property: 'p3', predicate: 'https://ex.org/p3' };

    expect(await handler.execute(third)).toEqual(deindent(`
      SELECT ?p3 WHERE {
        <https://example.org/#me> <https://ex.org/p1> ?v0.
        ?v0 <https://ex.org/p2> ?v1.
        ?v1 <https://ex.org/p3> ?p3.
      }`));
  });

  it('resolves a path with an property name ending in a non-word', async () => {
    const path = { subject: 'https://example.org/#me' };
    const first = { parent: path, property: '/x/', predicate: 'https://ex.org/p1' };

    expect(await handler.execute(first)).toEqual(deindent(`
      SELECT ?result WHERE {
        <https://example.org/#me> <https://ex.org/p1> ?result.
      }`));
  });
});
