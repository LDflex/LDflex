import MutationExpressionsHandler from '../../src/MutationExpressionsHandler';
import * as dataFactory from '@rdfjs/data-model';

describe('a MutationExpressionsHandler instance', () => {
  let handler;
  beforeAll(() => handler = new MutationExpressionsHandler());

  it('returns an empty array if no mutationExpressions is set', () => {
    expect(handler.execute({})).resolves.toEqual([]);
  });

  it('returns mutationExpressions from a single segment', () => {
    const mutationExpressions = Promise.resolve([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: dataFactory.namedNode('https://example.org/#me') }],
        predicate: dataFactory.namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: dataFactory.literal('other') }],
      },
    ]);
    return expect(handler.execute({ mutationExpressions })).resolves.toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: dataFactory.namedNode('https://example.org/#me') }],
        predicate: dataFactory.namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: dataFactory.literal('other') }],
      },
    ]);
  });

  it('returns mutationExpressions from a single segment with an empty parent', () => {
    const mutationExpressions = Promise.resolve([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: dataFactory.namedNode('https://example.org/#me') }],
        predicate: dataFactory.namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: dataFactory.literal('other') }],
      },
    ]);
    return expect(handler.execute({ mutationExpressions, parent: {} })).resolves.toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: dataFactory.namedNode('https://example.org/#me') }],
        predicate: dataFactory.namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: dataFactory.literal('other') }],
      },
    ]);
  });

  it('returns mutationExpressions from two segments', () => {
    const mutationExpressions = Promise.resolve([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: dataFactory.namedNode('https://example.org/#me') }],
        predicate: dataFactory.namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: dataFactory.literal('other') }],
      },
    ]);
    const mutationExpressionsParent = Promise.resolve([
      {
        mutationType: 'DELETE',
        domainExpression: [{ subject: dataFactory.namedNode('https://example.org/#me') }],
        predicate: dataFactory.namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: dataFactory.literal('other') }],
      },
    ]);
    const parent = { mutationExpressions: mutationExpressionsParent };
    return expect(handler.execute({ mutationExpressions, parent })).resolves.toEqual([
      {
        mutationType: 'DELETE',
        domainExpression: [{ subject: dataFactory.namedNode('https://example.org/#me') }],
        predicate: dataFactory.namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: dataFactory.literal('other') }],
      },
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: dataFactory.namedNode('https://example.org/#me') }],
        predicate: dataFactory.namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: dataFactory.literal('other') }],
      },
    ]);
  });

  it('returns mutationExpressions from the parent parent', () => {
    const mutationExpressions = Promise.resolve([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: dataFactory.namedNode('https://example.org/#me') }],
        predicate: dataFactory.namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: dataFactory.literal('other') }],
      },
    ]);
    return expect(handler.execute({ parent: { mutationExpressions } })).resolves.toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: dataFactory.namedNode('https://example.org/#me') }],
        predicate: dataFactory.namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: dataFactory.literal('other') }],
      },
    ]);
  });
});
