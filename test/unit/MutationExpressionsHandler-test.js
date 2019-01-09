import MutationExpressionsHandler from '../../src/MutationExpressionsHandler';

describe('a MutationExpressionsHandler instance', () => {
  let handler;
  beforeAll(() => handler = new MutationExpressionsHandler());

  it('returns undefined if no mutationExpressions is set', () => {
    expect(handler.execute({})).toBeUndefined();
  });

  it('returns a mutationExpressions', () => {
    const mutationExpressions = Promise.resolve([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: 'https://example.org/#me' }],
        predicate: 'https://ex.org/p1',
        rangeExpression: [{ subject: '"other"' }],
      },
    ]);
    return expect(handler.execute({ mutationExpressions })).resolves.toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: 'https://example.org/#me' }],
        predicate: 'https://ex.org/p1',
        rangeExpression: [{ subject: '"other"' }],
      },
    ]);
  });
});
