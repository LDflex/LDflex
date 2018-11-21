import PathProxy from '../../src/PathProxy';
import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';
import SparqlHandler from '../../src/SparqlHandler';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import JSONLDResolver from '../../src/JSONLDResolver';
import toSingularHandler from '../../src/toSingularHandler';
import { createQueryEngine } from '../util';

import context from '../context';

const subject = 'https://example.org/#me';
const queryEngine = createQueryEngine(['Alice', 'Bob', 'Carol']);

const resolvers = [
  new JSONLDResolver(context),
];

describe('a query path with a path expression handler', () => {
  const handlers = {
    sparql: new SparqlHandler(),
    pathExpression: new PathExpressionHandler(),
    [Symbol.asyncIterator]: new ExecuteQueryHandler(),
  };

  let person;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers, resolvers });
    person = pathProxy.createPath({ queryEngine }, { subject });
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
    sparql: new SparqlHandler(),
    pathExpression: new PathExpressionHandler(),
    then: toSingularHandler(new ExecuteQueryHandler()),
  };

  let person;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers, resolvers });
    person = pathProxy.createPath({ queryEngine }, { subject });
  });

  it('returns one result for a path with 3 links', async () => {
    const name = await person.friends.firstName;
    expect(`${name}`).toBe('Alice');
  });
});
