import PathProxy from '../../src/PathProxy';
import SparqlHandler from '../../src/SparqlHandler';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import InsertFunctionHandler from '../../src/InsertFunctionHandler';
import DeleteFunctionHandler from '../../src/DeleteFunctionHandler';
import MutationExpressionsHandler from '../../src/MutationExpressionsHandler';
import JSONLDResolver from '../../src/JSONLDResolver';

import context from '../context';
import { deindent } from '../util';

const FOAF = 'http://xmlns.com/foaf/0.1/';

describe('a query path with a path expression handler', () => {
  const handlers = {
    sparql: new SparqlHandler(),
    pathExpression: new PathExpressionHandler(),
    add: new InsertFunctionHandler(),
    delete: new DeleteFunctionHandler(),
    mutationExpressions: new MutationExpressionsHandler(),
  };
  const resolvers = [
    new JSONLDResolver(context),
  ];
  const subject = 'https://example.org/#me';

  let person;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers, resolvers });
    person = pathProxy.createPath({ subject });
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

  it('resolves a path with a prefixed name', async () => {
    const query = await person.friends.friends.foaf_depiction.sparql;
    expect(query).toEqual(deindent(`
      SELECT ?depiction WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?v1.
        ?v1 <${FOAF}depiction> ?depiction.
      }`));
  });

  it('resolves a path with a full URI', async () => {
    const query = await person.friends.friends[`${FOAF}depiction`].sparql;
    expect(query).toEqual(deindent(`
      SELECT ?depiction WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?v1.
        ?v1 <${FOAF}depiction> ?depiction.
      }`));
  });

  it('resolves a path with 1 link and an addition with a raw arg', async () => {
    const query = await person.firstName.add('Ruben').sparql;
    expect(query).toEqual(deindent(`
      INSERT DATA {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/givenName> "Ruben"
      }`));
  });

  it('resolves a path with 3 links and an addition with a raw arg', async () => {
    const query = await person.friends.friends.firstName.add('Ruben').sparql;
    expect(query).toEqual(deindent(`
      INSERT {
        ?knows <http://xmlns.com/foaf/0.1/givenName> "Ruben"
      } WHERE {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/knows> ?v0.
        ?v0 <http://xmlns.com/foaf/0.1/knows> ?knows.
      }`));
  });

  it('resolves a path with a full URI and an addition with a raw arg', async () => {
    const query = await person.friends.friends[`${FOAF}depiction`].add('Ruben').sparql;
    expect(query).toEqual(deindent(`
      INSERT {
        ?knows <http://xmlns.com/foaf/0.1/depiction> "Ruben"
      } WHERE {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/knows> ?v0.
        ?v0 <http://xmlns.com/foaf/0.1/knows> ?knows.
      }`));
  });

  it('resolves a path with 3 links and an addition with a path arg with length 0', async () => {
    const query = await person.friends.friends.firstName.add(person).sparql;
    expect(query).toEqual(deindent(`
      INSERT {
        ?knows <http://xmlns.com/foaf/0.1/givenName> <https://example.org/#me>
      } WHERE {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/knows> ?v0.
        ?v0 <http://xmlns.com/foaf/0.1/knows> ?knows.
      }`));
  });

  it('resolves a path with 3 links and an addition with a path arg with length 1', async () => {
    const query = await person.friends.friends.firstName.add(person.firstName).sparql;
    expect(query).toEqual(deindent(`
      INSERT {
        ?knows <http://xmlns.com/foaf/0.1/givenName> ?givenName
      } WHERE {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/knows> ?v0.
        ?v0 <http://xmlns.com/foaf/0.1/knows> ?knows.

        <https://example.org/#me> <http://xmlns.com/foaf/0.1/givenName> ?givenName.
      }`));
  });

  it('resolves a path with 3 links and an addition with three raw args', async () => {
    const query = await person.friends.friends.firstName.add('Ruben', 'RUBEN', 'ruben').sparql;
    expect(query).toEqual(deindent(`
      INSERT {
        ?knows <http://xmlns.com/foaf/0.1/givenName> "Ruben"
      } WHERE {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/knows> ?v0.
        ?v0 <http://xmlns.com/foaf/0.1/knows> ?knows.
      }
      ;
      INSERT {
        ?knows <http://xmlns.com/foaf/0.1/givenName> "RUBEN"
      } WHERE {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/knows> ?v0.
        ?v0 <http://xmlns.com/foaf/0.1/knows> ?knows.
      }
      ;
      INSERT {
        ?knows <http://xmlns.com/foaf/0.1/givenName> "ruben"
      } WHERE {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/knows> ?v0.
        ?v0 <http://xmlns.com/foaf/0.1/knows> ?knows.
      }`));
  });

  it('resolves a path with 3 links and an addition with a raw arg and path arg with length 1', async () => {
    const query = await person.friends.friends.firstName.add('Ruben', person.firstName).sparql;
    expect(query).toEqual(deindent(`
      INSERT {
        ?knows <http://xmlns.com/foaf/0.1/givenName> "Ruben"
      } WHERE {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/knows> ?v0.
        ?v0 <http://xmlns.com/foaf/0.1/knows> ?knows.
      }
      ;
      INSERT {
        ?knows <http://xmlns.com/foaf/0.1/givenName> ?givenName
      } WHERE {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/knows> ?v0.
        ?v0 <http://xmlns.com/foaf/0.1/knows> ?knows.

        <https://example.org/#me> <http://xmlns.com/foaf/0.1/givenName> ?givenName.
      }`));
  });

  it('resolves a path with 3 links and a deletion with a raw arg', async () => {
    const query = await person.friends.friends.firstName.delete('Ruben').sparql;
    expect(query).toEqual(deindent(`
      DELETE {
        ?knows <http://xmlns.com/foaf/0.1/givenName> "Ruben"
      } WHERE {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/knows> ?v0.
        ?v0 <http://xmlns.com/foaf/0.1/knows> ?knows.
      }`));
  });

  it('resolves a path with 3 links and a deletion and addition', async () => {
    const query = await person.friends.friends.firstName.delete('ruben').add('Ruben').sparql;
    expect(query).toEqual(deindent(`
      DELETE {
        ?knows <http://xmlns.com/foaf/0.1/givenName> "ruben"
      } WHERE {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/knows> ?v0.
        ?v0 <http://xmlns.com/foaf/0.1/knows> ?knows.
      }
      ;
      INSERT {
        ?knows <http://xmlns.com/foaf/0.1/givenName> "Ruben"
      } WHERE {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/knows> ?v0.
        ?v0 <http://xmlns.com/foaf/0.1/knows> ?knows.
      }`));
  });
});
