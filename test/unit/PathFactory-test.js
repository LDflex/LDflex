import PathFactory from '../../src/PathFactory';
import context from '../context';

describe('the PathFactory class', () => {
  it('exposes the defaultHandlers', () => {
    expect(PathFactory.defaultHandlers).toBeInstanceOf(Object);
    expect(PathFactory.defaultHandlers).toHaveProperty('then');
    expect(PathFactory.defaultHandlers).toHaveProperty('pathExpression');
    expect(PathFactory.defaultHandlers).toHaveProperty('sparql');
  });
});

describe('a PathFactory instance without parameters', () => {
  let factory, path;
  beforeAll(() => {
    factory = new PathFactory();
    path = factory.create();
  });

  it('adds __esModule', () => {
    expect(path.__esModule).toBeUndefined();
  });

  it('adds ExecuteQueryHandler for single values', () => {
    expect(path.then).toBeInstanceOf(Function);
  });

  it('adds ExecuteQueryHandler for asynchronous iteration', () => {
    expect(path[Symbol.asyncIterator]).toBeInstanceOf(Function);
  });

  it('adds PathExpressionHandler', async () => {
    await expect(path.pathExpression).rejects.toThrow(/root subject/);
  });

  it('adds SparqlHandler', async () => {
    await expect(path.sparql).rejects.toThrow(/root subject/);
  });

  it('adds StringToLDflexHandler', async () => {
    await expect(path.resolve('resolve')).toBeInstanceOf(Function);
  });

  it('does not add a JSONLDResolver', () => {
    expect(path.other).toBeUndefined();
  });
});

describe('a PathFactory instance without empty handlers and resolvers', () => {
  let factory, path;
  beforeAll(() => {
    factory = new PathFactory({ handlers: {}, resolvers: [] });
    path = factory.create();
  });

  it('does not add a SparqlHandler', () => {
    expect(path.sparql).toBeUndefined();
  });

  it('does not add a JSONLDResolver', () => {
    expect(path.other).toBeUndefined();
  });
});

describe('a PathFactory instance with initial settings and data', () => {
  let factory;
  beforeAll(() => factory = new PathFactory({
    foo: 'bar',
    handlers: {
      internal: { execute: pathProxy => pathProxy },
    },
  }, {
    a: 1,
  }));

  describe('creating path without parameters', () => {
    let path;
    beforeAll(() => (path = factory.create()));

    it('passes the settings', () => {
      expect(path.internal.settings).toEqual({ foo: 'bar' });
    });

    it('passes the data', () => {
      expect(path.internal).toHaveProperty('a', 1);
    });
  });

  describe('creating path with data', () => {
    let path;
    beforeAll(() => (path = factory.create({ b: 2 })));

    it('passes the settings', () => {
      expect(path.internal.settings).toEqual({ foo: 'bar' });
    });

    it('extends the data', () => {
      expect(path.internal).toHaveProperty('a', 1);
      expect(path.internal).toHaveProperty('b', 2);
    });
  });

  describe('creating path with data and settings', () => {
    let path;
    beforeAll(() => (path = factory.create({ other: 'x' }, { b: 2 })));

    it('extends the settings', () => {
      expect(path.internal.settings).toEqual({ foo: 'bar', other: 'x' });
    });

    it('extends the data', () => {
      expect(path.internal).toHaveProperty('a', 1);
      expect(path.internal).toHaveProperty('b', 2);
    });
  });
});

describe('a PathFactory instance with functions as handlers and resolvers', () => {
  let factory;
  beforeAll(() => factory = new PathFactory({
    handlers: {
      foo: () => 'foo',
    },
    resolvers: [
      () => 'bar',
      { supports: () => true, resolve: () => 'baz' },
    ],
  }));

  it('creates a handler', () => {
    expect(factory.create().foo).toBe('foo');
  });

  it('creates a catch-all resolver', () => {
    expect(factory.create().other).toBe('bar');
  });
});

describe('a PathFactory instance with a context parameter', () => {
  let factory, path;
  beforeAll(() => {
    factory = new PathFactory({ context });
    path = factory.create();
  });

  it('adds __esModule', () => {
    expect(path.__esModule).toBeUndefined();
  });

  it('adds a JSONLDResolver', () => {
    expect(path.knows).toBeInstanceOf(Object);
  });
});
