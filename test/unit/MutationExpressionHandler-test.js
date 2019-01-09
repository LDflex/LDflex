import InsertExpressionHandler from '../../src/InsertExpressionHandler';

describe('a MutationExpressionHandler instance', () => {
  let handler;
  beforeAll(() => handler = new InsertExpressionHandler());

  it('resolves to function', async () => {
    expect(typeof await handler.execute({}, {})).toEqual('function');
  });

  it('resolves to function that returns a proxy with mutationExpressions', async () => {
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
    expect(await handler.execute({ proxyHandler }, {})('Ruben').mutationExpressions).toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [{ subject: 'https://example.org/#me' }],
        predicate: 'https://ex.org/p1',
        rangeExpression: [{ subject: '"Ruben"' }],
      },
    ]);
  });
});
