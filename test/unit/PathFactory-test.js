import PathFactory from '../../src/PathFactory';
import context from '../context';
import * as dataFactory from '@rdfjs/data-model';

describe('the PathFactory module', () => {
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

describe('a PathFactory instance with an undefined subject', () => {
  let factory, path;
  beforeAll(() => {
    factory = new PathFactory(undefined, { subject: undefined });
    path = factory.create();
  });

  it('has then set to a function', () => {
    expect(path.then).toBeInstanceOf(Function);
  });

  it('has then rejecting with an error', async () => {
    await expect(path.then()).rejects.toBeInstanceOf(Error);
  });

  it('has an asyncIterator rejecting with an error', async () => {
    await expect((async () => {
      const items = [];
      for await (const item of path)
        items.push(item);
    })()).rejects.toBeInstanceOf(Error);
  });
});

describe('a PathFactory instance with a Term as subject', () => {
  let term, factory, path;
  beforeAll(() => {
    term = dataFactory.literal('foo', 'en-us');
    factory = new PathFactory(undefined, { subject: term });
    path = factory.create();
  });

  it('has then set to undefined', () => {
    expect(path.then).toBeUndefined();
  });

  it('exposes its termType', () => {
    expect(path.termType).toBe('Literal');
  });

  it('exposes its value', () => {
    expect(path.value).toBe('foo');
  });

  it('exposes its language', () => {
    expect(path.language).toBe('en-us');
  });

  it('exposes its datatype', () => {
    const langString = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString';
    expect(path.datatype).toEqual(dataFactory.namedNode(langString));
  });

  it('exposes its string value', () => {
    expect(path.toString()).toBe('foo');
  });

  it('exposes its primitive value', () => {
    expect(path.toPrimitive()).toBe('foo');
  });

  it('is equal to the term', () => {
    expect(path.equals(term)).toBe(true);
    expect(term.equals(path)).toBe(true);
  });

  it('has an asyncIterator that contains the term', async () => {
    const items = [];
    for await (const item of path)
      items.push(item);
    expect(items).toHaveLength(1);
    expect(term.equals(items[0])).toBe(true);
    expect(items[0].equals(term)).toBe(true);
  });
});

describe('a PathFactory instance with a promise to a Term as subject', () => {
  let term, factory, path;
  beforeAll(() => {
    term = dataFactory.literal('foo', 'en-us');
    factory = new PathFactory(undefined, { subject: Promise.resolve(term) });
    path = factory.create();
  });

  it('has then set to a function', () => {
    expect(path.then).toBeInstanceOf(Function);
  });

  describe('the value returned by then', () => {
    let value;
    beforeAll(async () => {
      value = await path;
    });

    it('is a path', async () => {
      await expect(value.sparql).rejects.toThrow(/predicate/);
    });

    it('has then set to undefined', () => {
      expect(value.then).toBeUndefined();
    });

    it('exposes its termType', () => {
      expect(value.termType).toBe('Literal');
    });

    it('exposes its value', () => {
      expect(value.value).toBe('foo');
    });

    it('exposes its language', () => {
      expect(value.language).toBe('en-us');
    });

    it('exposes its datatype', () => {
      const langString = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString';
      expect(value.datatype).toEqual(dataFactory.namedNode(langString));
    });

    it('exposes its string value', () => {
      expect(value.toString()).toBe('foo');
    });

    it('exposes its primitive value', () => {
      expect(value.toPrimitive()).toBe('foo');
    });

    it('is equal to the term', () => {
      expect(value.equals(term)).toBe(true);
      expect(term.equals(value)).toBe(true);
    });

    it('has an asyncIterator that contains the term', async () => {
      const items = [];
      for await (const item of value)
        items.push(item);
      expect(items).toHaveLength(1);
      expect(term.equals(items[0])).toBe(true);
      expect(items[0].equals(term)).toBe(true);
    });
  });

  it('has an asyncIterator that contains the term', async () => {
    const items = [];
    for await (const item of path)
      items.push(item);
    expect(items).toHaveLength(1);
    expect(term.equals(items[0])).toBe(true);
    expect(items[0].equals(term)).toBe(true);
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
      expect(path.internal.settings).toEqual({ dataFactory, foo: 'bar' });
    });

    it('passes the data', () => {
      expect(path.internal).toHaveProperty('a', 1);
    });
  });

  describe('creating path with data', () => {
    let path;
    beforeAll(() => (path = factory.create({ b: 2 })));

    it('passes the settings', () => {
      expect(path.internal.settings).toEqual({ dataFactory, foo: 'bar' });
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
      expect(path.internal.settings).toEqual({ dataFactory, foo: 'bar', other: 'x' });
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
