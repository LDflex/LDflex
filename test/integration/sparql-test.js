import DataHandler from '../../src/DataHandler';
import PathProxy from '../../src/PathProxy';
import SparqlHandler from '../../src/SparqlHandler';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import InsertFunctionHandler from '../../src/InsertFunctionHandler';
import DeleteFunctionHandler from '../../src/DeleteFunctionHandler';
import MutationExpressionsHandler from '../../src/MutationExpressionsHandler';
import PredicateHandler from '../../src/PredicateHandler';
import PredicatesHandler from '../../src/PredicatesHandler';
import SetFunctionHandler from '../../src/SetFunctionHandler';
import SortHandler from '../../src/SortHandler';
import SubjectHandler from '../../src/SubjectHandler';
import ThenHandler from '../../src/ThenHandler';
import ReplaceFunctionHandler from '../../src/ReplaceFunctionHandler';
import JSONLDResolver from '../../src/JSONLDResolver';
import { namedNode } from '@rdfjs/data-model';

import context from '../context';
import { deindent } from '../util';

const FOAF = 'http://xmlns.com/foaf/0.1/';

describe('a query path with a path expression handler', () => {
  const handlers = {
    sparql: new SparqlHandler(),
    pathExpression: new PathExpressionHandler(),
    add: new InsertFunctionHandler(),
    delete: new DeleteFunctionHandler(),
    properties: new PredicatesHandler(),
    predicate: new PredicateHandler(),
    predicates: new PredicatesHandler(),
    mutationExpressions: new MutationExpressionsHandler(),
    replace: new ReplaceFunctionHandler(),
    set: new SetFunctionHandler(),
    sort: new SortHandler(),
    subject: new SubjectHandler(),
    then: new ThenHandler(),
    [Symbol.asyncIterator]: {
      handle() {
        const iterable = (async function *() {
          yield namedNode('http://ex.org/#1');
          yield namedNode('http://ex.org/#2');
        }());
        return () => iterable[Symbol.asyncIterator]();
      },
    },
    value: DataHandler.sync('subject', 'value'),
    termType: DataHandler.sync('subject', 'termType'),
  };
  const resolvers = [
    new JSONLDResolver(context),
  ];
  const subject = namedNode('https://example.org/#me');

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

  it('resolves a path with 3 links and a sort operation', async () => {
    const query = await person.friends.friends.name.sort('familyName', 'givenName').sparql;
    expect(query).toEqual(deindent(`
      SELECT ?v2 WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?v1.
        ?v1 <${FOAF}name> ?v2.
        ?v2 <${FOAF}familyName> ?v3.
        ?v2 <${FOAF}givenName> ?givenName.
      }
      ORDER BY ASC(?v3) ASC(?givenName)`));
  });

  it('resolves a path with 3 links and fixed values', async () => {
    const query = await person.friends.friends(namedNode('http://ex.org/Alice'), namedNode('http://ex.org/Bob')).name.sparql;
    expect(query).toEqual(deindent(`
      SELECT ?name WHERE {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/knows> ?v0.
        ?v0 <http://xmlns.com/foaf/0.1/knows> <http://ex.org/Alice>, <http://ex.org/Bob>.
        ?v0 <http://xmlns.com/foaf/0.1/name> ?name.
      }`));
  });

  it('resolves a path with 3 links and reversed fixed values', async () => {
    const query = await person.friends.friendOf(namedNode('http://ex.org/Alice'), namedNode('http://ex.org/Bob')).name.sparql;
    expect(query).toEqual(deindent(`
      SELECT ?name WHERE {
        <https://example.org/#me> <http://xmlns.com/foaf/0.1/knows> ?v0.
        <http://ex.org/Alice> <http://xmlns.com/foaf/0.1/knows> ?v0.
        <http://ex.org/Bob> <http://xmlns.com/foaf/0.1/knows> ?v0.
        ?v0 <http://xmlns.com/foaf/0.1/name> ?name.
      }`));
  });

  it('resolves a path with 1 link and a predicates call', async () => {
    const query = await person.predicates.sparql;
    expect(query).toEqual(deindent(`
      SELECT DISTINCT ?predicate WHERE {
        ?subject ?predicate ?object.
      }`));
  });

  it('resolves a path with 3 links and a predicates call', async () => {
    const query = await person.friends.friends.predicates.sparql;
    expect(query).toEqual(deindent(`
      SELECT DISTINCT ?predicate WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?friends.
        ?friends ?predicate ?object.
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
        <https://example.org/#me> <${FOAF}givenName> "Ruben".
      }`));
  });

  it('resolves a path with 3 links and an addition with a raw arg', async () => {
    const query = await person.friends.friends.firstName.add('Ruben').sparql;
    expect(query).toEqual(deindent(`
      INSERT {
        ?knows <${FOAF}givenName> "Ruben".
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?knows.
      }`));
  });

  it('resolves a path with a full URI and an addition with a raw arg', async () => {
    const query = await person.friends.friends[`${FOAF}depiction`].add('Ruben').sparql;
    expect(query).toEqual(deindent(`
      INSERT {
        ?knows <${FOAF}depiction> "Ruben".
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?knows.
      }`));
  });

  it('resolves a path with 3 links and an addition with a path arg', async () => {
    const query = await person.friends.friends.firstName.add(person.friends).sparql;
    expect(query).toEqual(deindent(`
      INSERT {
        ?knows <${FOAF}givenName> <http://ex.org/#1>, <http://ex.org/#2>.
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?knows.
      }`));
  });

  it('resolves a path with 3 links and an addition with three raw args', async () => {
    const query = await person.friends.friends.firstName.add('Ruben', 'RUBEN', 'ruben').sparql;
    expect(query).toEqual(deindent(`
      INSERT {
        ?knows <${FOAF}givenName> "Ruben", "RUBEN", "ruben".
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?knows.
      }`));
  });

  it('resolves a path with 3 links and a deletion without args', async () => {
    const query = await person.friends.friends.delete().sparql;
    expect(query).toEqual(deindent(`
      DELETE {
        ?knows <${FOAF}knows> ?knows_0.
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?knows.
      }`));
  });

  it('errors on a path with 3 links and an addition without args', async () => {
    expect(() => person.friends.friends.add().sparql)
      .toThrow(new Error('Mutation cannot be invoked without arguments'));
  });

  it('resolves a path with 3 links and an addition with a raw arg and path arg', async () => {
    const query = await person.friends.friends.firstName.add('Ruben', person.friends).sparql;
    expect(query).toEqual(deindent(`
      INSERT {
        ?knows <${FOAF}givenName> "Ruben", <http://ex.org/#1>, <http://ex.org/#2>.
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?knows.
      }`));
  });

  it('resolves a path with 3 links and a deletion with a raw arg', async () => {
    const query = await person.friends.friends.firstName.delete('Ruben').sparql;
    expect(query).toEqual(deindent(`
      DELETE {
        ?knows <${FOAF}givenName> "Ruben".
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?knows.
      }`));
  });

  it('resolves a path where an object map has different conditions', async () => {
    const query = await person.delete({ friends: null, firstName: 'Ruben' }).sparql;
    expect(query).toEqual(deindent(`
      DELETE DATA {
        <https://example.org/#me> <${FOAF}knows> ?knows.
        <https://example.org/#me> <${FOAF}givenName> "Ruben".
      }`));
  });

  it('resolves a path with 3 links and a deletion and addition', async () => {
    const query = await person.friends.friends.firstName.delete('ruben').add('Ruben').sparql;
    expect(query).toEqual(deindent(`
      DELETE {
        ?knows <${FOAF}givenName> "ruben".
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?knows.
      }
      ;
      INSERT {
        ?knows <${FOAF}givenName> "Ruben".
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?knows.
      }`));
  });

  it('resolves a path with 3 links and a set', async () => {
    const query = await person.friends.friends.firstName.set('Ruben').sparql;
    expect(query).toEqual(deindent(`
      DELETE {
        ?knows <${FOAF}givenName> ?givenName.
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?knows.
      }
      ;
      INSERT {
        ?knows <${FOAF}givenName> "Ruben".
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?knows.
      }`));
  });

  it('resolves a path with 3 links and a set with multiple values', async () => {
    const query = await person.friends.friends.firstName.set('Ruben', 'ruben').sparql;
    expect(query).toEqual(deindent(`
      DELETE {
        ?knows <${FOAF}givenName> ?givenName.
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?knows.
      }
      ;
      INSERT {
        ?knows <${FOAF}givenName> "Ruben", "ruben".
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?knows.
      }`));
  });

  it('resolves a path with 3 links and a replace', async () => {
    const query = await person.friends.friends.firstName.replace('ruben', 'Ruben').sparql;
    expect(query).toEqual(deindent(`
      DELETE {
        ?knows <${FOAF}givenName> "ruben".
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?knows.
      }
      ;
      INSERT {
        ?knows <${FOAF}givenName> "Ruben".
      } WHERE {
        <https://example.org/#me> <${FOAF}knows> ?v0.
        ?v0 <${FOAF}knows> ?knows.
      }`));
  });
});
