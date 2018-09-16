import QueryPath from '../../src/QueryPath';
import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';
import JSONLDResolver from '../../src/JSONLDResolver';

import context from '../context';

describe('a query path with a path expression handler', () => {
  const handlers = {
    [Symbol.asyncIterator]: new ExecuteQueryHandler(),
  };
  const resolvers = [
    new JSONLDResolver(context),
  ];
  const subject = 'https://example.org/#me';

  const queryEngine = {
    execute: jest.fn(() => {
      const results = ['Alice', 'Bob', 'Carol']
        .map(value => ({ value }));
      return {
        next: () => new Promise(resolve =>
          resolve({
            done: results.length === 0,
            value: new Map([['?firstName', results.shift()]]),
          })),
      };
    }),
  };

  let person;
  beforeAll(() => {
    person = new QueryPath({ handlers, resolvers, queryEngine }, { subject });
  });

  it('returns results for a path with 3 links', async () => {
    const names = [];
    for await (const firstName of person.friends.firstName)
      names.push(firstName);
    expect(names.map(n => `${n}`)).toEqual(['Alice', 'Bob', 'Carol']);
  });
});
