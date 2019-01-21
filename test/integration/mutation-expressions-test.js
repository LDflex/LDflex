import PathProxy from '../../src/PathProxy';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import InsertFunctionHandler from '../../src/InsertFunctionHandler';
import DeleteFunctionHandler from '../../src/DeleteFunctionHandler';
import MutationExpressionsHandler from '../../src/MutationExpressionsHandler';
import JSONLDResolver from '../../src/JSONLDResolver';
import context from '../context';
import * as dataFactory from '@rdfjs/data-model';

describe('a query path with a path expression handler', () => {
  const handlers = {
    pathExpression: new PathExpressionHandler(),
    add: new InsertFunctionHandler(),
    delete: new DeleteFunctionHandler(),
    mutationExpressions: new MutationExpressionsHandler(),
  };
  const resolvers = [
    new JSONLDResolver(context),
  ];
  const subject = dataFactory.namedNode('https://example.org/#me');

  let person;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers, resolvers });
    person = pathProxy.createPath({ dataFactory }, { subject });
  });

  it('resolves an addition path with 2 links and a raw arg', async () => {
    const path = await person.friends.firstName.add('Ruben').mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName'),
        rangeExpression: [{ subject: dataFactory.literal('Ruben') }],
      },
    ]);
  });

  it('resolves an addition path with 2 links and a path arg of length 0', async () => {
    const path = await person.friends.firstName.add(person).mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName'),
        rangeExpression: [
          { subject },
        ],
      },
    ]);
  });

  it('resolves an addition path with 2 links and a path arg of length 1', async () => {
    const path = await person.friends.firstName.add(person.firstName).mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName'),
        rangeExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName') },
        ],
      },
    ]);
  });

  it('resolves an addition path with 2 links and a path arg of length 2', async () => {
    const path = await person.friends.firstName.add(person.friends.firstName).mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName'),
        rangeExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/knows') },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName') },
        ],
      },
    ]);
  });

  it('resolves an addition path with 2 links and a raw and path arg', async () => {
    const path = await person.friends.firstName.add('Ruben', person.firstName).mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName'),
        rangeExpression: [{ subject: dataFactory.literal('Ruben') }],
      },
      {
        mutationType: 'INSERT',
        domainExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName'),
        rangeExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName') },
        ],
      },
    ]);
  });

  it('resolves a deletion path with 2 links and a raw and path arg', async () => {
    const path = await person.friends.firstName.delete('Ruben', person.firstName).mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'DELETE',
        domainExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName'),
        rangeExpression: [{ subject: dataFactory.literal('Ruben') }],
      },
      {
        mutationType: 'DELETE',
        domainExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName'),
        rangeExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName') },
        ],
      },
    ]);
  });

  it('resolves a path with 2 links and an deletion and addition', async () => {
    const path = await person.friends.firstName.delete('ruben').add('Ruben').mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'DELETE',
        domainExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName'),
        rangeExpression: [{ subject: dataFactory.literal('ruben') }],
      },
      {
        mutationType: 'INSERT',
        domainExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName'),
        rangeExpression: [{ subject: dataFactory.literal('Ruben') }],
      },
    ]);
  });

  it('resolves a path with 2 links and an deletion, a link, and addition', async () => {
    const path = await person.friends.delete(person).firstName.add('Ruben').mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'DELETE',
        domainExpression: [
          { subject },
        ],
        predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/knows'),
        rangeExpression: [{ subject }],
      },
      {
        mutationType: 'INSERT',
        domainExpression: [
          { subject },
          { predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/knows') },
        ],
        predicate: dataFactory.namedNode('http://xmlns.com/foaf/0.1/givenName'),
        rangeExpression: [{ subject: dataFactory.literal('Ruben') }],
      },
    ]);
  });
});
