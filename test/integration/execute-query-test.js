import QueryPath from '../../src/QueryPath';
import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';
import JSONLDResolver from '../../src/JSONLDResolver';

import context from '../context';

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
const resolvers = [
  new JSONLDResolver(context),
];

describe('a query path with a path expression handler', () => {
  const handlers = {
    [Symbol.asyncIterator]: new ExecuteQueryHandler(),
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

describe('a query path with a path expression handler in single mode', () => {
  const handlers = {
    then: new ExecuteQueryHandler({ single: true }),
  };

  let person;
  beforeAll(() => {
    person = new QueryPath({ handlers, resolvers, queryEngine }, { subject });
  });

  it('returns one result for a path with 3 links', async () => {
    const name = await person.friends.firstName;
    expect(`${name}`).toBe('Alice');
  });
});
