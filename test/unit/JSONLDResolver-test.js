import JSONLDResolver from '../../src/JSONLDResolver';

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
  const context = {
    knows: 'http://xmlns.com/foaf/0.1/knows',
  };

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

    it('extends the path with a foaf:knows expression', async () => {
      expect(queryPath.extend).toBeCalledTimes(1);
      const args = queryPath.extend.mock.calls[0];
      expect(args).toHaveLength(1);

      const { pathExpression } = args[0];
      expect(await pathExpression).toBe('http://xmlns.com/foaf/0.1/knows');
    });

    it('returns the extended path', () => {
      expect(result).toEqual(extendedPath);
    });
  });
});
