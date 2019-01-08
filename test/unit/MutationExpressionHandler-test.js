import MutationExpressionHandler from '../../src/MutationExpressionHandler';

describe('a MutationExpressionHandler instance', () => {
  let handler;
  beforeAll(() => handler = new MutationExpressionHandler('INSERT'));

  it('resolves to function', async () => {
    expect(typeof await handler.execute({}, {})).toEqual('function');
  });

  it('resolves to function that returns a proxy with mutationExpression', async () => {
    const pathExpression = [
      { subject: 'https://example.org/#me' },
      { predicate: 'https://ex.org/p1' },
    ];
    const proxyHandler = {
      _handlers: {
        pathExpression: { execute: () => pathExpression },
      },
      _resolvers: [],
    };
    expect(await handler.execute({ proxyHandler }, {})('Ruben').mutationExpression).toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: 'https://example.org/#me' }],
        predicate: 'https://ex.org/p1',
        rangeExpression: [{ subject: '"Ruben"' }],
      },
    ]);
  });
});
