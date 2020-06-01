import PathFactory from '../../src/PathFactory';
import context from '../context';
import { namedNode, literal } from '@rdfjs/data-model';
import { iterableToArray } from '../../src/iterableUtils';

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

  it('adds ExecuteQueryHandler', () => {
    expect(path.results[Symbol.asyncIterator]).toBeInstanceOf(Function);
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
    await expect(iterableToArray(path)).rejects.toBeInstanceOf(Error);
  });
});

describe('a PathFactory instance with a Term as subject', () => {
  let term, factory, path;
  beforeAll(() => {
    term = literal('foo', 'en-us');
    term.canonical = namedNode('urn:canonical:test');
    factory = new PathFactory(undefined, { subject: term });
    path = factory.create();
  });

  it('exposes the subject', async () => {
    expect((await path.subject).value).toBe('foo');
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
    expect(path.datatype).toEqual(namedNode(langString));
  });

  it('exposes its string value', () => {
    expect(path.toString()).toBe('foo');
  });

  it('exposes its primitive value', () => {
    expect(path.toPrimitive()).toBe('foo');
  });

  it('exposes its canonical value', () => {
    expect(path.canonical).toBe(term.canonical);
  });

  it('is equal to the term', () => {
    expect(path.equals(term)).toBe(true);
    expect(term.equals(path)).toBe(true);
  });

  describe('its asyncIterator', () => {
    let items;
    beforeAll(async () => items = await iterableToArray(path));

    it('has one element', () => {
      expect(items).toHaveLength(1);
    });

    it('exposes the subject', () => {
      expect(term.equals(items[0])).toBe(true);
      expect(items[0].equals(term)).toBe(true);
    });

    it('exposes the subject as a path', async () => {
      await expect(items[0].sparql).rejects.toThrow(/predicate/);
    });
  });

  it('can be converted into an array', async () => {
    const items = await path.toArray();
    expect(items).toHaveLength(1);
    expect(term.equals(items[0])).toBe(true);
    expect(items[0].equals(term)).toBe(true);
  });

  it('exposes termTypes as an array', async () => {
    const items = await path.termTypes;
    expect(items).toEqual([term.termType]);
  });

  it('exposes values as an array', async () => {
    const items = await path.values;
    expect(items).toEqual([term.value]);
  });

  it('exposes datatypes as an array', async () => {
    const items = await path.datatypes;
    expect(items).toEqual([term.datatype]);
  });

  it('exposes languages as an array', async () => {
    const items = await path.languages;
    expect(items).toEqual([term.language]);
  });
});

describe('a PathFactory instance with a promise to a Term as subject', () => {
  let term, factory, path;
  beforeAll(() => {
    term = literal('foo', 'en-us');
    factory = new PathFactory(undefined, { subject: Promise.resolve(term) });
    path = factory.create();
  });

  it('exposes the subject', async () => {
    expect((await path.subject).value).toBe('foo');
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
      expect(value.datatype).toEqual(namedNode(langString));
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

    describe('its asyncIterator', () => {
      let items;
      beforeAll(async () => items = await iterableToArray(path));

      it('has one element', () => {
        expect(items).toHaveLength(1);
      });

      it('exposes the subject', () => {
        expect(term.equals(items[0])).toBe(true);
        expect(items[0].equals(term)).toBe(true);
      });

      it('exposes the subject as a path', async () => {
        await expect(items[0].sparql).rejects.toThrow(/predicate/);
      });
    });

    it('can be converted into an array', async () => {
      const items = await path.toArray();
      expect(items).toHaveLength(1);
      expect(term.equals(items[0])).toBe(true);
      expect(items[0].equals(term)).toBe(true);
    });

    it('exposes the values as an array', async () => {
      const items = await path.values;
      expect(items).toEqual([term.value]);
    });
  });

  describe('its asyncIterator', () => {
    let items;
    beforeAll(async () => items = await iterableToArray(path));

    it('has one element', () => {
      expect(items).toHaveLength(1);
    });

    it('exposes the subject', () => {
      expect(term.equals(items[0])).toBe(true);
      expect(items[0].equals(term)).toBe(true);
    });

    it('exposes the subject as a path', async () => {
      await expect(items[0].sparql).rejects.toThrow(/predicate/);
    });
  });

  it('can be converted into an array', async () => {
    const items = await path.toArray();
    expect(items).toHaveLength(1);
    expect(term.equals(items[0])).toBe(true);
    expect(items[0].equals(term)).toBe(true);
  });

  it('exposes the values as an array', async () => {
    const items = await path.values;
    expect(items).toEqual([term.value]);
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
      internal: { handle: pathProxy => pathProxy },
    },
  }, {
    a: 1,
  }));

  describe('creating path without parameters', () => {
    let path;
    beforeAll(() => (path = factory.create()));

    it('passes the settings', () => {
      expect(path.internal.settings).toHaveProperty('foo', 'bar');
    });

    it('passes the data', () => {
      expect(path.internal).toHaveProperty('a', 1);
    });

    it('sets an empty context on the settings', () => {
      expect(path.internal.settings).toHaveProperty('context', {});
    });

    it('sets an empty parsedContext on the settings', () => {
      expect(path.internal.settings).toHaveProperty('parsedContext', {});
    });
  });

  describe('creating path with data', () => {
    let path;
    beforeAll(() => (path = factory.create({ b: 2 })));

    it('passes the settings', () => {
      expect(path.internal.settings).toHaveProperty('foo', 'bar');
    });

    it('extends the data', () => {
      expect(path.internal).toHaveProperty('a', 1);
      expect(path.internal).toHaveProperty('b', 2);
    });

    it('sets an empty context on the settings', () => {
      expect(path.internal.settings).toHaveProperty('context', {});
    });

    it('sets an empty parsedContext on the settings', () => {
      expect(path.internal.settings).toHaveProperty('parsedContext', {});
    });
  });

  describe('creating path with data and settings', () => {
    let path;
    beforeAll(() => (path = factory.create({ other: 'x' }, { b: 2 })));

    it('extends the settings', () => {
      expect(path.internal.settings).toHaveProperty('foo', 'bar');
      expect(path.internal.settings).toHaveProperty('other', 'x');
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
    factory = new PathFactory({
      context,
      handlers: {
        internal: { handle: pathProxy => pathProxy },
      },
    });
    path = factory.create();
  });

  it('adds __esModule', () => {
    const emptyPath = new PathFactory({ context }).create();
    expect(emptyPath.__esModule).toBeUndefined();
  });

  it('adds a JSONLDResolver', () => {
    expect(path.knows).toBeInstanceOf(Object);
  });

  it('sets the context on the settings', () => {
    expect(path.internal.settings).toHaveProperty('context', context);
  });

  it('sets the parsedContext on the settings', async () => {
    const parsedContext = await path.internal.settings.parsedContext;
    expect(context['@context']).toHaveProperty('friends', 'foaf:knows');
    expect(parsedContext).toHaveProperty('friends', 'http://xmlns.com/foaf/0.1/knows');
  });
});
