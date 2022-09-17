import PathProxy from '../../src/PathProxy';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import InsertFunctionHandler from '../../src/InsertFunctionHandler';
import DeleteFunctionHandler from '../../src/DeleteFunctionHandler';
import SparqlHandler from '../../src/SparqlHandler';
import MutationExpressionsHandler from '../../src/MutationExpressionsHandler';
import JSONLDResolver from '../../src/JSONLDResolver';
import context from '../context';
import { namedNode, literal, blankNode } from '@rdfjs/data-model';

describe('a query path with a path expression handler', () => {
  const handlers = {
    pathExpression: new PathExpressionHandler(),
    add: new InsertFunctionHandler(),
    delete: new DeleteFunctionHandler(),
    mutationExpressions: new MutationExpressionsHandler(),
    [Symbol.asyncIterator]: {
      handle() {
        const iterable = (async function *() {
          yield namedNode('http://ex.org/#1');
          yield namedNode('http://ex.org/#2');
        }());
        return () => iterable[Symbol.asyncIterator]();
      },
    },
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

  it('resolves an addition path with 2 links and a raw arg', async () => {
    const path = await person.friends.firstName.add('Ruben').mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'INSERT',
        conditions: [
          { subject },
          { predicate: namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicateObjects: [{
          predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
          objects: [literal('Ruben')],
        }],
      },
    ]);
  });

  it('resolves an addition path with 2 links and a path arg', async () => {
    const path = await person.friends.firstName.add(person.friends).mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'INSERT',
        conditions: [
          { subject },
          { predicate: namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicateObjects: [{
          predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
          objects: [namedNode('http://ex.org/#1'), namedNode('http://ex.org/#2')],
        }],
      },
    ]);
  });

  it('resolves an addition path with 2 links and a raw and path arg', async () => {
    const path = await person.friends.firstName.add('Ruben', person.friends).mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'INSERT',
        conditions: [
          { subject },
          { predicate: namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicateObjects: [{
          predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
          objects: [literal('Ruben'), namedNode('http://ex.org/#1'), namedNode('http://ex.org/#2')],
        }],
      },
    ]);
  });

  it('resolves a deletion path with 2 links and a raw and path arg', async () => {
    const path = await person.friends.firstName.delete('Ruben', person.friends).mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'DELETE',
        conditions: [
          { subject },
          { predicate: namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicateObjects: [{
          predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
          objects: [literal('Ruben'), namedNode('http://ex.org/#1'), namedNode('http://ex.org/#2')],
        }],
      },
    ]);
  });

  it('resolves a path with 2 links and n deletion and addition', async () => {
    const path = await person.friends.firstName.delete('ruben').add('Ruben').mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'DELETE',
        conditions: [
          { subject },
          { predicate: namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicateObjects: [{
          predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
          objects: [literal('ruben')],
        }],
      },
      {
        mutationType: 'INSERT',
        conditions: [
          { subject },
          { predicate: namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicateObjects: [{
          predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
          objects: [literal('Ruben')],
        }],
      },
    ]);
  });

  it('resolves a path with 2 links and a deletion, a link, and addition', async () => {
    const path = await person.friends.delete(person.friends).firstName.add('Ruben').mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'DELETE',
        conditions: [
          { subject },
        ],
        predicateObjects: [{
          predicate: namedNode('http://xmlns.com/foaf/0.1/knows'),
          objects: [namedNode('http://ex.org/#1'), namedNode('http://ex.org/#2')],
        }],
      },
      {
        mutationType: 'INSERT',
        conditions: [
          { subject },
          { predicate: namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicateObjects: [{
          predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
          objects: [literal('Ruben')],
        }],
      },
    ]);
  });

  it('resolves a path with a deletion of 2 links, an addition on a link, a link and another addition on a link using object maps', async () => {
    const path = await person
      .delete({ friends: person.friends, firstName: 'ruben' })
      .add({ firstName: 'Ruben' })
      .friends.add({ firstName: 'Ruben' }).mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'DELETE',
        conditions: [
          { subject },
        ],
        predicateObjects: [
          {
            predicate: namedNode('http://xmlns.com/foaf/0.1/knows'),
            objects: [namedNode('http://ex.org/#1'), namedNode('http://ex.org/#2')],
          },
          {
            predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
            objects: [literal('ruben')],
          },
        ],
      },
      {
        mutationType: 'INSERT',
        conditions: [
          { subject },
        ],
        predicateObjects: [{
          predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
          objects: [literal('Ruben')],
        }],
      },
      {
        mutationType: 'INSERT',
        conditions: [
          { subject },
          { predicate: namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicateObjects: [{
          predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
          objects: [literal('Ruben')],
        }],
      },
    ]);
  });

  it('resolves a path where an object map has different conditions', async () => {
    const path = await person.delete({ friends: null, firstName: 'ruben' }).mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'DELETE',
        conditions: [
          { subject },
        ],
        predicateObjects: [
          {
            predicate: namedNode('http://xmlns.com/foaf/0.1/knows'),
            objects: null,
          },
          {
            predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
            objects: [literal('ruben')],
          },
        ],
      },
    ]);
  });

  it('skolemizes blank nodes inside mutationExpressions', async () => {
    const handler = new SparqlHandler();
    const mutationExpressions = [
      {
        mutationType: 'INSERT',
        conditions: [{ subject: blankNode('a') }],
        predicateObjects: [{
          predicate: namedNode('https://example.org/p'),
          objects: [blankNode('b')],
        }],
      },
    ];

    const query = await handler.handle({}, { mutationExpressions });

    expect(query).toContain('urn:ldflex:sk0');
    expect(query).toContain('urn:ldflex:sk1');
  });
});
