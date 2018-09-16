import QueryPath from '../../src/QueryPath';
import SparqlHandler from '../../src/SparqlHandler';
import JSONLDResolver from '../../src/JSONLDResolver';

import context from '../context';
import { deindent } from '../util';

const FOAF = 'http://xmlns.com/foaf/0.1/';

describe('a query path with a path expression handler', () => {
  const handlers = {
    sparql: new SparqlHandler(),
  };
  const resolvers = [
    new JSONLDResolver(context),
  ];
  const subject = 'https://example.org/#me';

  let person;
  beforeAll(() => {
    person = new QueryPath({ handlers, resolvers }, { subject });
  });

  it('resolves a path with 3 links', async () => {
    const query = await person.friends.friends.firstName.sparql;
    expect(query).toEqual(deindent(`
      SELECT ?firstName WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?v1.
        ?v1 <${FOAF}givenName> ?firstName.
      }`));
  });
});
