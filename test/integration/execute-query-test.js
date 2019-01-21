import PathProxy from '../../src/PathProxy';
import FallbackHandler from '../../src/FallbackHandler';
import SubjectHandler from '../../src/SubjectHandler';
import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';
import SparqlHandler from '../../src/SparqlHandler';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import InsertFunctionHandler from '../../src/InsertFunctionHandler';
import DeleteFunctionHandler from '../../src/DeleteFunctionHandler';
import MutationExpressionsHandler from '../../src/MutationExpressionsHandler';
import ReplaceFunctionHandler from '../../src/ReplaceFunctionHandler';
import SetFunctionHandler from '../../src/SetFunctionHandler';
import DataHandler from '../../src/DataHandler';
import JSONLDResolver from '../../src/JSONLDResolver';
import { conditionalHandler, getIterator, iterableToThen, promiseToIterable } from '../../src/iterableUtils';
import { createQueryEngine } from '../util';
import * as dataFactory from '@rdfjs/data-model';

import context from '../context';

const subject = dataFactory.namedNode('https://example.org/#me');
const queryEngine = createQueryEngine([
  dataFactory.literal('Alice'),
  dataFactory.literal('Bob'),
  dataFactory.literal('Carol'),
]);

const iteratorHandler = new FallbackHandler([
  promiseToIterable(new SubjectHandler()),
  new ExecuteQueryHandler(),
]);
const resolvers = [
  new JSONLDResolver(context),
];
const handlersPath = {
  sparql: new SparqlHandler(),
  pathExpression: new PathExpressionHandler(),
  mutationExpressions: new MutationExpressionsHandler(),
  toString: DataHandler.syncFunction('subject', 'value'),
  [Symbol.asyncIterator]: getIterator(iteratorHandler),
  then: conditionalHandler(iterableToThen(iteratorHandler), (path) => !path.subject),
};

const handlersMutation = {
  sparql: new SparqlHandler(),
  pathExpression: new PathExpressionHandler(),
  add: new InsertFunctionHandler(),
  delete: new DeleteFunctionHandler(),
  mutationExpressions: new MutationExpressionsHandler(),
  replace: new ReplaceFunctionHandler(),
  set: new SetFunctionHandler(),
  toString: DataHandler.syncFunction('subject', 'value'),
  [Symbol.asyncIterator]: getIterator(iteratorHandler),
  then: conditionalHandler(iterableToThen(iteratorHandler), (path) => !path.subject),
};

describe('a query path with a path expression handler', () => {
  let person;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers: handlersPath, resolvers });
    person = pathProxy.createPath({ queryEngine, dataFactory }, { subject });
  });

  it('returns results for a path with 3 links', async () => {
    const names = [];
    for await (const firstName of person.friends.firstName)
      names.push(firstName);
    expect(names.map(n => `${n}`)).toEqual(['Alice', 'Bob', 'Carol']);
  });

  it('returns results for nested expression calls', async () => {
    const names = [];
    for await (const friend of person.friends) {
      for await (const firstName of friend.friends.firstName)
        names.push(firstName);
    }
    expect(names.map(n => `${n}`)).toEqual(['Alice', 'Bob', 'Carol', 'Alice', 'Bob', 'Carol', 'Alice', 'Bob', 'Carol']);
  });
});

describe('a query path with a path and mutation expression handler', () => {
  let person;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers: handlersMutation, resolvers });
    person = pathProxy.createPath({ queryEngine, dataFactory }, { subject });
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

  it('returns true for an set with 3 links', async () => {
    expect(await person.friends.firstName.set('Ruben')).toBeTruthy();
  });

  it('returns true for an replace with 3 links', async () => {
    expect(await person.friends.firstName.set('ruben', 'Ruben')).toBeTruthy();
  });
});
