import PathProxy from '../../src/PathProxy';
import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';
import SparqlHandler from '../../src/SparqlHandler';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import JSONLDResolver from '../../src/JSONLDResolver';
import { getIterator, iterableToThen } from '../../src/iterableUtils';
import { createQueryEngine } from '../util';

import context from '../context';

const subject = 'https://example.org/#me';
const queryEngine = createQueryEngine(['Alice', 'Bob', 'Carol']);

const executeQueryHandler = new ExecuteQueryHandler();
const resolvers = [
  new JSONLDResolver(context),
];
const handlers = {
  sparql: new SparqlHandler(),
  pathExpression: new PathExpressionHandler(),
  [Symbol.asyncIterator]: getIterator(executeQueryHandler),
  then: iterableToThen(executeQueryHandler),
};

describe('a query path with a path expression handler', () => {
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
