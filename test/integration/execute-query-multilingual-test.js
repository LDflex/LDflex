import PathProxy from '../../src/PathProxy';
import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';
import SparqlHandler from '../../src/SparqlHandler';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import DataHandler from '../../src/DataHandler';
import JSONLDResolver from '../../src/JSONLDResolver';
import LanguageResolver from '../../src/LanguageResolver';
import MutationExpressionsHandler from '../../src/MutationExpressionsHandler';
import { createQueryEngine } from '../util';
import { namedNode, literal } from '@rdfjs/data-model';

import context from '../context';
import ThenHandler from '../../src/ThenHandler';

const subject = namedNode('https://example.org/#me');
const queryEngine = createQueryEngine([
  literal('Tomato', 'en'),
  literal('Tomaat', 'nl'),
  literal('Tomate', 'de'),
]);

const resolvers = [
  new LanguageResolver(),
  new JSONLDResolver(context),
];
const handlersPath = {
  then: new ThenHandler(),
  mutationExpressions: new MutationExpressionsHandler(),
  sparql: new SparqlHandler(),
  pathExpression: new PathExpressionHandler(),
  results: new ExecuteQueryHandler(),
  [Symbol.asyncIterator]: {
    handle(pathData, path) {
      return () => path.results[Symbol.asyncIterator]();
    },
  },
  toString: DataHandler.syncFunction('subject', 'value'),
};

describe('a query path with languages', () => {
  let tomato;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers: handlersPath, resolvers });
    tomato = pathProxy.createPath({ queryEngine }, { subject });
  });

  it('returns results in the current language', async () => {
    const dutchLabel = await tomato.label.nl;
    expect(`${dutchLabel}`).toEqual('Tomaat');
  });
});
