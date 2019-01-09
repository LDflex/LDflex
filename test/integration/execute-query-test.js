import PathProxy from '../../src/PathProxy';
import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';
import SparqlHandler from '../../src/SparqlHandler';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import MutationExpressionHandler from '../../src/MutationExpressionHandler';
import VoidHandler from '../../src/VoidHandler';
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
const handlersPath = {
  sparql: new SparqlHandler(),
  pathExpression: new PathExpressionHandler(),
  mutationExpressions: new VoidHandler(), // Initialize mutationExpressions to undefined to avoid being handled by another handler.
  [Symbol.asyncIterator]: getIterator(executeQueryHandler),
  then: iterableToThen(executeQueryHandler),
};

const handlersMutation = {
  sparql: new SparqlHandler(),
  pathExpression: new PathExpressionHandler(),
  mutationExpressions: new VoidHandler(), // Initialize mutationExpressions to undefined to avoid being handled by another handler.
  add: new MutationExpressionHandler(MutationExpressionHandler.INSERT),
  delete: new MutationExpressionHandler(MutationExpressionHandler.DELETE),
  [Symbol.asyncIterator]: getIterator(executeQueryHandler),
  then: iterableToThen(executeQueryHandler),
};

describe('a query path with a path expression handler', () => {
  let person;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers: handlersPath, resolvers });
    person = pathProxy.createPath({ queryEngine }, { subject });
  });

  it('returns results for a path with 3 links', async () => {
    const names = [];
    for await (const firstName of person.friends.firstName)
      names.push(firstName);
    expect(names.map(n => `${n}`)).toEqual(['Alice', 'Bob', 'Carol']);
  });
});

describe('a query path with a path and mutation expression handler', () => {
  let person;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers: handlersMutation, resolvers });
    person = pathProxy.createPath({ queryEngine }, { subject });
  });

  it('returns results for a path with 3 links', async () => {
    const names = [];
    for await (const firstName of person.friends.firstName)
      names.push(firstName);
    expect(names.map(n => `${n}`)).toEqual(['Alice', 'Bob', 'Carol']);
  });

  it('returns true for an addition with 3 links', async () => {
    expect(await person.friends.firstName.add('Ruben')).toBeTruthy();
  });
});
