import QueryPath from '../../src/QueryPath';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import JSONLDResolver from '../../src/JSONLDResolver';
import context from '../context';

describe('a query path with a path expression handler', () => {
  const handlers = {
    pathExpression: new PathExpressionHandler(),
  };
  const resolvers = [
    new JSONLDResolver(context),
  ];
  const subject = 'https://example.org/#me';

  let person;
  beforeAll(() => {
    person = new QueryPath({ handlers, resolvers }, { subject });
  });

  it('resolves a path with 2 links', async () => {
    const path = await person.friends.firstName.pathExpression;
    expect(path).toEqual([
      { subject },
      { predicate: 'http://xmlns.com/foaf/0.1/knows' },
      { predicate: 'http://xmlns.com/foaf/0.1/givenName' },
    ]);
  });
});
