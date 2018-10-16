import QueryPathFactory from '../../src/QueryPathFactory';
import context from '../context';

describe('a QueryPathFactory instance without parameters', () => {
  let factory;
  beforeAll(() => factory = new QueryPathFactory());

  it('adds PathExpressionHandler', () => {
    expect(factory.create().pathExpression).rejects.toThrow(/root subject/);
  });

  it('adds SparqlHandler', () => {
    expect(factory.create().sparql).rejects.toThrow(/root subject/);
  });

  it('adds ExecuteQueryHandler for single values', () => {
    expect(() => factory.create().then).toBeInstanceOf(Function);
  });

  it('adds ExecuteQueryHandler for asynchronous iteration', () => {
    expect(() => factory.create()[Symbol.asyncIterator]).toBeInstanceOf(Function);
  });

  it('does not add a JSONLDResolver', () => {
    expect(factory.create({}).other).toBeUndefined();
  });

  it('allows passing of settings', () => {
    expect(factory.create({ handlers: {} }, {}).sparql).toBeUndefined();
  });
});

describe('a QueryPathFactory instance without empty handlers and resolvers', () => {
  let factory;
  beforeAll(() => factory = new QueryPathFactory({ handlers: {}, resolvers: [] }));

  it('does not add a SparqlHandler', () => {
    expect(factory.create().sparql).toBeUndefined();
  });

  it('does not add a JSONLDResolver', () => {
    expect(factory.create().other).toBeUndefined();
  });
});

describe('a QueryPathFactory instance with a context parameter', () => {
  let factory;
  beforeAll(() => factory = new QueryPathFactory({ context }));

  it('adds a JSONLDResolver', () => {
    expect(factory.create().knows).toBeInstanceOf(Object);
  });
});
