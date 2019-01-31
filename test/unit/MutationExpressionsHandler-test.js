import MutationExpressionsHandler from '../../src/MutationExpressionsHandler';
import { namedNode, literal } from '@rdfjs/data-model';

describe('a MutationExpressionsHandler instance', () => {
  let handler;
  beforeAll(() => handler = new MutationExpressionsHandler());

  it('returns an empty array if no mutationExpressions is set', () => {
    expect(handler.handle({})).resolves.toEqual([]);
  });

  it('returns mutationExpressions from a single segment', () => {
    const mutationExpressions = Promise.resolve([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: namedNode('https://example.org/#me') }],
        predicate: namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: literal('other') }],
      },
    ]);
    return expect(handler.handle({ mutationExpressions })).resolves.toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: namedNode('https://example.org/#me') }],
        predicate: namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: literal('other') }],
      },
    ]);
  });

  it('returns mutationExpressions from a single segment with an empty parent', () => {
    const mutationExpressions = Promise.resolve([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: namedNode('https://example.org/#me') }],
        predicate: namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: literal('other') }],
      },
    ]);
    return expect(handler.handle({ mutationExpressions, parent: {} })).resolves.toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: namedNode('https://example.org/#me') }],
        predicate: namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: literal('other') }],
      },
    ]);
  });

  it('returns mutationExpressions from two segments', () => {
    const mutationExpressions = Promise.resolve([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: namedNode('https://example.org/#me') }],
        predicate: namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: literal('other') }],
      },
    ]);
    const mutationExpressionsParent = Promise.resolve([
      {
        mutationType: 'DELETE',
        domainExpression: [{ subject: namedNode('https://example.org/#me') }],
        predicate: namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: literal('other') }],
      },
    ]);
    const parent = { mutationExpressions: mutationExpressionsParent };
    return expect(handler.handle({ mutationExpressions, parent })).resolves.toEqual([
      {
        mutationType: 'DELETE',
        domainExpression: [{ subject: namedNode('https://example.org/#me') }],
        predicate: namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: literal('other') }],
      },
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: namedNode('https://example.org/#me') }],
        predicate: namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: literal('other') }],
      },
    ]);
  });

  it('returns mutationExpressions from the parent parent', () => {
    const mutationExpressions = Promise.resolve([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: namedNode('https://example.org/#me') }],
        predicate: namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: literal('other') }],
      },
    ]);
    return expect(handler.handle({ parent: { mutationExpressions } })).resolves.toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: namedNode('https://example.org/#me') }],
        predicate: namedNode('https://ex.org/p1'),
        rangeExpression: [{ subject: literal('other') }],
      },
    ]);
  });
});
