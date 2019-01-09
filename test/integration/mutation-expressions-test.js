import PathProxy from '../../src/PathProxy';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import InsertExpressionHandler from '../../src/InsertExpressionHandler';
import DeleteExpressionHandler from '../../src/DeleteExpressionHandler';
import JSONLDResolver from '../../src/JSONLDResolver';
import context from '../context';

describe('a query path with a path expression handler', () => {
  const handlers = {
    pathExpression: new PathExpressionHandler(),
    add: new InsertExpressionHandler(),
    delete: new DeleteExpressionHandler(),
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

  it('resolves an addition path with 2 links and a raw arg', async () => {
    const path = await person.friends.firstName.add('Ruben').mutationExpressions;
    expect(path).toEqual([
      {
        mutationType: 'INSERT',
        domainExpression: [
          { subject },
          { predicate: 'http://xmlns.com/foaf/0.1/knows' },
        ],
        predicate: 'http://xmlns.com/foaf/0.1/givenName',
        rangeExpression: [{ subject: '"Ruben"' }],
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
          { predicate: 'http://xmlns.com/foaf/0.1/knows' },
        ],
        predicate: 'http://xmlns.com/foaf/0.1/givenName',
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
          { predicate: 'http://xmlns.com/foaf/0.1/knows' },
        ],
        predicate: 'http://xmlns.com/foaf/0.1/givenName',
        rangeExpression: [
          { subject },
          { predicate: 'http://xmlns.com/foaf/0.1/givenName' },
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
          { predicate: 'http://xmlns.com/foaf/0.1/knows' },
        ],
        predicate: 'http://xmlns.com/foaf/0.1/givenName',
        rangeExpression: [
          { subject },
          { predicate: 'http://xmlns.com/foaf/0.1/knows' },
          { predicate: 'http://xmlns.com/foaf/0.1/givenName' },
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
          { predicate: 'http://xmlns.com/foaf/0.1/knows' },
        ],
        predicate: 'http://xmlns.com/foaf/0.1/givenName',
        rangeExpression: [{ subject: '"Ruben"' }],
      },
      {
        mutationType: 'INSERT',
        domainExpression: [
          { subject },
          { predicate: 'http://xmlns.com/foaf/0.1/knows' },
        ],
        predicate: 'http://xmlns.com/foaf/0.1/givenName',
        rangeExpression: [
          { subject },
          { predicate: 'http://xmlns.com/foaf/0.1/givenName' },
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
          { predicate: 'http://xmlns.com/foaf/0.1/knows' },
        ],
        predicate: 'http://xmlns.com/foaf/0.1/givenName',
        rangeExpression: [{ subject: '"Ruben"' }],
      },
      {
        mutationType: 'DELETE',
        domainExpression: [
          { subject },
          { predicate: 'http://xmlns.com/foaf/0.1/knows' },
        ],
        predicate: 'http://xmlns.com/foaf/0.1/givenName',
        rangeExpression: [
          { subject },
          { predicate: 'http://xmlns.com/foaf/0.1/givenName' },
        ],
      },
    ]);
  });
});
