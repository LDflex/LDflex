import JSONLDResolver from '../../src/JSONLDResolver';
import context from '../context';

describe('a JSONLDResolver instance', () => {
  let resolver;
  beforeAll(() => resolver = new JSONLDResolver());

  it('supports strings', () => {
    expect(resolver.supports('foo')).toBe(true);
  });

  it('does not support symbols', () => {
    expect(resolver.supports(Symbol('foo'))).toBe(false);
  });
});

describe('a JSONLDResolver instance with a context', () => {
  let resolver;
  beforeAll(() => resolver = new JSONLDResolver(context));

  describe('expanding a property', () => {
    it('expands knows to foaf:knows', async () => {
      expect(await resolver.expandProperty('knows'))
        .toBe('http://xmlns.com/foaf/0.1/knows');
    });

    it('errors when expanding an unknown property', () => {
      expect(resolver.expandProperty('other'))
        .rejects.toThrow(new Error("Property 'other' could not be expanded from the context"));
    });
  });

  describe('resolving the knows property', () => {
    const extendedPath = {};
    const queryPath = {
      extend: jest.fn(() => extendedPath),
    };

    let result;
    beforeEach(() => result = resolver.resolve(queryPath, 'knows'));

    it('extends the path', () => {
      expect(queryPath.extend).toBeCalledTimes(1);
      const args = queryPath.extend.mock.calls[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBeInstanceOf(Object);
    });

    it('sets property to knows', () => {
      const { property } = queryPath.extend.mock.calls[0][0];
      expect(property).toBe('knows');
    });

    it('sets predicate to a promise for foaf:knows', async () => {
      const { predicate } = queryPath.extend.mock.calls[0][0];
      expect(await predicate).toBe('http://xmlns.com/foaf/0.1/knows');
    });

    it('returns the extended path', () => {
      expect(result).toEqual(extendedPath);
    });
  });

  describe('resolving the foaf:knows property', () => {
    const extendedPath = {};
    const queryPath = {
      extend: jest.fn(() => extendedPath),
    };

    let result;
    beforeEach(() => result = resolver.resolve(queryPath, 'foaf:knows'));

    it('extends the path', () => {
      expect(queryPath.extend).toBeCalledTimes(1);
      const args = queryPath.extend.mock.calls[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBeInstanceOf(Object);
    });

    it('sets property to foaf:knows', () => {
      const { property } = queryPath.extend.mock.calls[0][0];
      expect(property).toBe('foaf:knows');
    });

    it('sets predicate to a promise for foaf:knows', async () => {
      const { predicate } = queryPath.extend.mock.calls[0][0];
      expect(await predicate).toBe('http://xmlns.com/foaf/0.1/knows');
    });

    it('returns the extended path', () => {
      expect(result).toEqual(extendedPath);
    });
  });

  describe('resolving the foaf_knows property', () => {
    const extendedPath = {};
    const queryPath = {
      extend: jest.fn(() => extendedPath),
    };

    let result;
    beforeEach(() => result = resolver.resolve(queryPath, 'foaf_knows'));

    it('extends the path', () => {
      expect(queryPath.extend).toBeCalledTimes(1);
      const args = queryPath.extend.mock.calls[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBeInstanceOf(Object);
    });

    it('sets property to foaf_knows', () => {
      const { property } = queryPath.extend.mock.calls[0][0];
      expect(property).toBe('foaf_knows');
    });

    it('sets predicate to a promise for foaf:knows', async () => {
      const { predicate } = queryPath.extend.mock.calls[0][0];
      expect(await predicate).toBe('http://xmlns.com/foaf/0.1/knows');
    });

    it('returns the extended path', () => {
      expect(result).toEqual(extendedPath);
    });
  });
});
