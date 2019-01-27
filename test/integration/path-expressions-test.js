import PathProxy from '../../src/PathProxy';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import JSONLDResolver from '../../src/JSONLDResolver';
import context from '../context';
import { namedNode } from '@rdfjs/data-model';

describe('a query path with a path expression handler', () => {
  const handlers = {
    pathExpression: new PathExpressionHandler(),
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

  it('resolves a path with 2 links', async () => {
    const path = await person.friends.firstName.pathExpression;
    expect(path).toEqual([
      { subject },
      { predicate: namedNode('http://xmlns.com/foaf/0.1/knows') },
      { predicate: namedNode('http://xmlns.com/foaf/0.1/givenName') },
    ]);
  });
});
