import PathProxy from '../../src/PathProxy';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import InsertFunctionHandler from '../../src/InsertFunctionHandler';
import DeleteFunctionHandler from '../../src/DeleteFunctionHandler';
import MutationExpressionsHandler from '../../src/MutationExpressionsHandler';
import JSONLDResolver from '../../src/JSONLDResolver';
import context from '../context';
import { namedNode, literal } from '@rdfjs/data-model';

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
        predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
        objects: [literal('Ruben')],
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
        predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
        objects: [namedNode('http://ex.org/#1'), namedNode('http://ex.org/#2')],
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
        predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
        objects: [literal('Ruben'), namedNode('http://ex.org/#1'), namedNode('http://ex.org/#2')],
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
        predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
        objects: [literal('Ruben'), namedNode('http://ex.org/#1'), namedNode('http://ex.org/#2')],
      },
    ]);
  });

  it('resolves a path with 2 links and an deletion and addition', async () => {
    const path = await person.friends.firstName.delete('ruben').add('Ruben').mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'DELETE',
        conditions: [
          { subject },
          { predicate: namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
        objects: [literal('ruben')],
      },
      {
        mutationType: 'INSERT',
        conditions: [
          { subject },
          { predicate: namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
        objects: [literal('Ruben')],
      },
    ]);
  });

  it('resolves a path with 2 links and an deletion, a link, and addition', async () => {
    const path = await person.friends.delete(person.friends).firstName.add('Ruben').mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'DELETE',
        conditions: [
          { subject },
        ],
        predicate: namedNode('http://xmlns.com/foaf/0.1/knows'),
        objects: [namedNode('http://ex.org/#1'), namedNode('http://ex.org/#2')],
      },
      {
        mutationType: 'INSERT',
        conditions: [
          { subject },
          { predicate: namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicate: namedNode('http://xmlns.com/foaf/0.1/givenName'),
        objects: [literal('Ruben')],
      },
    ]);
  });
});
