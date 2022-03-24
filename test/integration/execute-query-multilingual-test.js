import PathProxy from '../../src/PathProxy';
import JSONLDResolver from '../../src/JSONLDResolver';
import LanguageResolver from '../../src/LanguageResolver';
import { createQueryEngine } from '../util';
import { namedNode, literal } from '@rdfjs/data-model';
import defaultHandlers from '../../src/defaultHandlers';

import context from '../context';

const subject = namedNode('https://example.org/#me');
const queryEngine = createQueryEngine([
  literal('Tomato', 'en'),
  literal('Tomaat', 'nl'),
  literal('Tomate', 'de'),
]);

const resolvers = [
  new LanguageResolver(context),
  new JSONLDResolver(context),
];

describe('a query path with languages', () => {
  let tomato;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers: defaultHandlers, resolvers });
    tomato = pathProxy.createPath({ queryEngine }, { subject });
  });

  it('returns results in the current language', async () => {
    const dutchLabel = await tomato.label['@nl'];
    expect(`${dutchLabel}`).toEqual('Tomaat');
  });
});
