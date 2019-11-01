import PathProxy from '../../src/PathProxy';
import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';
import SparqlHandler from '../../src/SparqlHandler';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import DataHandler from '../../src/DataHandler';
import { createQueryEngine } from '../util';
import { namedNode } from '@rdfjs/data-model';

import context from '../context';
import { ContextParser } from 'jsonld-context-parser';
import PropertiesHandler from '../../src/PropertiesHandler';
import PredicatesHandler from '../../src/PredicatesHandler';

const subject = namedNode('https://example.org/#me');
const queryEngine = createQueryEngine([
  namedNode('http://xmlns.com/foaf/0.1/knows'),
  namedNode('http://xmlns.com/foaf/0.1/name'),
  namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
]);

const handlers = {
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

describe('a query path with a properties handler with parsed context', () => {
  let person;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers });
    person = pathProxy.createPath({
      queryEngine,
      parsedContext: new ContextParser().parse(context),
    }, { subject });
  });

  it('compacts properties on a path', async () => {
    const names = [];
    for await (const p of person.properties)
      names.push(p);
    expect(names.map(n => `${n}`)).toEqual(['knows', 'name', 'label']);
  });

  it('compacts the first property on a path', async () => {
    expect(`${await person.properties}`).toEqual('knows');
  });
});

describe('a query path with a properties handler without parsed context', () => {
  let person;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers });
    person = pathProxy.createPath({ queryEngine }, { subject });
  });

  it('does not compact properties on a path', async () => {
    const names = [];
    for await (const p of person.properties)
      names.push(p);
    expect(names.map(n => `${n}`)).toEqual([
      'http://xmlns.com/foaf/0.1/knows',
      'http://xmlns.com/foaf/0.1/name',
      'http://www.w3.org/2000/01/rdf-schema#label',
    ]);
  });
});
