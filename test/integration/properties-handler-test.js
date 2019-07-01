import PathProxy from '../../src/PathProxy';
import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';
import SparqlHandler from '../../src/SparqlHandler';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import DataHandler from '../../src/DataHandler';
import JSONLDResolver from '../../src/JSONLDResolver';
import { createQueryEngine } from '../util';
import { literal, namedNode } from '@rdfjs/data-model';

import context from '../context';
import PropertiesHandler from '../../src/PropertiesHandler';
import PredicatesHandler from '../../src/PredicatesHandler';

const subject = namedNode('https://example.org/#me');
const queryEngine = createQueryEngine([
  literal('knows'),
  literal('http://xmlns.com/foaf/0.1/name'),
  literal('http://www.w3.org/2000/01/rdf-schema#label'),
]);

const resolvers = [
  new JSONLDResolver(context),
];
const handlersPath = {
  sparql: new SparqlHandler(),
  pathExpression: new PathExpressionHandler(),
  results: new ExecuteQueryHandler(),
  properties: new PropertiesHandler(),
  predicates: new PredicatesHandler(),
  [Symbol.asyncIterator]: {
    handle(pathData, path) {
      return () => path.results[Symbol.asyncIterator]();
    },
  },
  toString: DataHandler.syncFunction('subject', 'value'),
};

describe('a query path with a properties handler', () => {
  let person;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers: handlersPath, resolvers, context });
    person = pathProxy.createPath({ queryEngine }, { subject });
  });

  it('returns results for a path', async () => {
    const names = [];
    for await (const p of person.properties)
      names.push(p);
    expect(names.map(n => `${n}`)).toEqual(['knows', 'foaf:name', 'label']);
  });
});
