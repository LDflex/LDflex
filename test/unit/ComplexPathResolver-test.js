import JSONLDResolver from '../../src/JSONLDResolver';
import ComplexPathResolver from '../../src/ComplexPathResolver';
import context from '../context';
import { namedNode, literal } from '@rdfjs/data-model';

describe('a JSONLDResolver instance', () => {
  let resolver;
  beforeAll(() => resolver = new ComplexPathResolver(JSONLDResolver));

  it('supports strings', () => {
    expect(resolver.supports('foo')).toBe(true);
  });

  it('does not support symbols', () => {
    expect(resolver.supports(Symbol('foo'))).toBe(false);
  });
});

describe('[Testing ComplexPath Resolver respects JSONLDResolver] a JSONLDResolver instance with a context', () => {
  let resolver;
  beforeAll(() => resolver = new ComplexPathResolver(JSONLDResolver, context));

  describe('expanding a property', () => {
    it('expands knows to foaf:knows', async () => {
      expect(await resolver.expandProperty('knows'))
        .toEqual(namedNode('http://xmlns.com/foaf/0.1/knows'));
    });

    it('errors when expanding an unknown property', async () => {
      await expect(resolver.expandProperty('other')).rejects
        .toThrow(new Error("The Complex Path Resolver cannot expand the 'other' path"));
    });

    it('errors when expanding a variable property', async () => {
      await expect(resolver.expandProperty('?p')).rejects
        .toThrow(new Error("The Complex Path Resolver cannot expand the '?p' path"));
    });
  });

  describe('resolving the knows property', () => {
    const extendedPath = {};
    const pathData = { extendPath: jest.fn(() => extendedPath) };

    let result;
    beforeEach(() => result = resolver.resolve('knows', pathData));

    it('extends the path', () => {
      expect(pathData.extendPath).toBeCalledTimes(1);
      const args = pathData.extendPath.mock.calls[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBeInstanceOf(Object);
    });

    it('sets property to knows', () => {
      const { property } = pathData.extendPath.mock.calls[0][0];
      expect(property).toBe('knows');
    });

    it('sets predicate to a promise for foaf:knows', async () => {
      const { predicate } = pathData.extendPath.mock.calls[0][0];
      expect(await predicate).toEqual(namedNode('http://xmlns.com/foaf/0.1/knows'));
    });

    it('returns the extended path', () => {
      expect(result).toBe(extendedPath);
    });
  });

  describe('resolving the knows property and calling it as a function', () => {
    const path = {};
    const pathData = { extendPath: jest.fn(data => ({ ...data })) };

    let result;
    beforeEach(() => result = resolver.resolve('knows', pathData));

    it('sets up the function through apply', () => {
      expect(result.apply).toBeInstanceOf(Function);
    });

    it('errors if there are no arguments', () => {
      expect(() => result.apply([], result, path))
        .toThrow(new Error('Specify at least one term when calling .knows() on a path'));
    });

    describe('with two strings', () => {
      let applied;
      beforeEach(() => applied = result.apply(['Ruben', 'Joachim'], result, path));

      it('returns the proxied path', () => {
        expect(applied).toBe(path);
      });

      it('stores the new values in the result', () => {
        expect(result.values).toEqual([literal('Ruben'), literal('Joachim')]);
      });
    });

    describe('with 2 terms', () => {
      const ruben = namedNode('Ruben');
      const joachim = namedNode('Joachim');

      let applied;
      beforeEach(() => applied = result.apply([ruben, joachim], result, path));

      it('returns the proxied path', () => {
        expect(applied).toBe(path);
      });

      it('stores the new values in the result', () => {
        expect(result.values).toEqual([ruben, joachim]);
      });
    });
  });

  describe('resolving the foaf:knows property', () => {
    const extendedPath = {};
    const pathData = { extendPath: jest.fn(() => extendedPath) };

    let result;
    beforeEach(() => result = resolver.resolve('foaf:knows', pathData));

    it('extends the path', () => {
      expect(pathData.extendPath).toBeCalledTimes(1);
      const args = pathData.extendPath.mock.calls[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBeInstanceOf(Object);
    });

    it('sets property to foaf:knows', () => {
      const { property } = pathData.extendPath.mock.calls[0][0];
      expect(property).toBe('foaf:knows');
    });

    it('sets predicate to a promise for foaf:knows', async () => {
      const { predicate } = pathData.extendPath.mock.calls[0][0];
      expect(await predicate).toEqual(namedNode('http://xmlns.com/foaf/0.1/knows'));
    });

    it('returns the extended path', () => {
      expect(result).toBe(extendedPath);
    });
  });

  describe('resolving the foaf_knows property', () => {
    const extendedPath = {};
    const pathData = { extendPath: jest.fn(() => extendedPath) };

    let result;
    beforeEach(() => result = resolver.resolve('foaf_knows', pathData));

    it('extends the path', () => {
      expect(pathData.extendPath).toBeCalledTimes(1);
      const args = pathData.extendPath.mock.calls[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBeInstanceOf(Object);
    });

    it('sets property to foaf_knows', () => {
      const { property } = pathData.extendPath.mock.calls[0][0];
      expect(property).toBe('foaf_knows');
    });

    it('sets predicate to a promise for foaf:knows', async () => {
      const { predicate } = pathData.extendPath.mock.calls[0][0];
      expect(await predicate).toEqual(namedNode('http://xmlns.com/foaf/0.1/knows'));
    });

    it('returns the extended path', () => {
      expect(result).toBe(extendedPath);
    });
  });

  describe('resolving the foaf$knows property', () => {
    const extendedPath = {};
    const pathData = { extendPath: jest.fn(() => extendedPath) };

    let result;
    beforeEach(() => result = resolver.resolve('foaf$knows', pathData));

    it('extends the path', () => {
      expect(pathData.extendPath).toBeCalledTimes(1);
      const args = pathData.extendPath.mock.calls[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBeInstanceOf(Object);
    });

    it('sets property to foaf$knows', () => {
      const { property } = pathData.extendPath.mock.calls[0][0];
      expect(property).toBe('foaf$knows');
    });

    it('sets predicate to a promise for foaf:knows', async () => {
      const { predicate } = pathData.extendPath.mock.calls[0][0];
      expect(await predicate).toEqual(namedNode('http://xmlns.com/foaf/0.1/knows'));
    });

    it('returns the extended path', () => {
      expect(result).toBe(extendedPath);
    });
  });

  describe('resolving the foaf:topic_interest property', () => {
    const extendedPath = {};
    const pathData = { extendPath: jest.fn(() => extendedPath) };

    let result;
    beforeEach(() => result = resolver.resolve('foaf:topic_interest', pathData));

    it('extends the path', () => {
      expect(pathData.extendPath).toBeCalledTimes(1);
      const args = pathData.extendPath.mock.calls[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBeInstanceOf(Object);
    });

    it('sets property to foaf:topic_interest', () => {
      const { property } = pathData.extendPath.mock.calls[0][0];
      expect(property).toBe('foaf:topic_interest');
    });

    it('sets predicate to a promise for foaf:topic_interest', async () => {
      const { predicate } = pathData.extendPath.mock.calls[0][0];
      expect(await predicate).toEqual(namedNode('http://xmlns.com/foaf/0.1/topic_interest'));
    });

    it('returns the extended path', () => {
      expect(result).toBe(extendedPath);
    });
  });

  describe('resolving the makerOf property', () => {
    const extendedPath = {};
    const pathData = { extendPath: jest.fn(() => extendedPath) };

    let result;
    beforeEach(() => result = resolver.resolve('makerOf', pathData));

    it('extends the path', () => {
      expect(pathData.extendPath).toBeCalledTimes(1);
      const args = pathData.extendPath.mock.calls[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBeInstanceOf(Object);
    });

    it('sets property to makerOf', () => {
      const { property } = pathData.extendPath.mock.calls[0][0];
      expect(property).toBe('makerOf');
    });

    it('sets predicate to a promise for foaf:maker', async () => {
      const { predicate } = pathData.extendPath.mock.calls[0][0];
      await expect(predicate).resolves.toEqual(namedNode('http://xmlns.com/foaf/0.1/maker'));
    });

    it('sets the reverse property to a promise resolving to true', async () => {
      const { reverse } = pathData.extendPath.mock.calls[0][0];
      await expect(reverse).resolves.toBeTruthy();
    });

    it('returns the extended path', () => {
      expect(result).toBe(extendedPath);
    });
  });

  describe('when the context is extended', () => {
    describe('before extending', () => {
      it('does not resolve sameAs', async () => {
        await expect(resolver.expandProperty('sameAs')).rejects
          .toThrow(new Error("The Complex Path Resolver cannot expand the 'sameAs' path"));
      });
    });

    describe('after extending', () => {
      beforeAll(async () => {
        await resolver.extendContext({
          '@context': {
            owl: 'http://www.w3.org/2002/07/owl#',
          },
        }, {
          sameAs: 'owl:sameAs',
        });
      });

      const pathData = { extendPath: jest.fn() };
      beforeEach(() => resolver.resolve('sameAs', pathData));

      it('sets predicate to a promise for sameAs', async () => {
        const { predicate } = pathData.extendPath.mock.calls[0][0];
        expect(await predicate).toEqual(namedNode('http://www.w3.org/2002/07/owl#sameAs'));
      });
    });
  });

  describe('when a propertyCache is present', () => {
    const extendedPath = {};
    const pathData = {
      extendPath: jest.fn(() => extendedPath),
      propertyCache: Promise.resolve({
        'http://xmlns.com/foaf/0.1/knows': [
          { subject: namedNode('http://people.example/#Alice') },
          { subject: namedNode('http://people.example/#Bob') },
        ],
      }),
    };

    describe('when accessing a non-cached property', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:givenName', pathData));

      it('extends the path without a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBeUndefined();
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing a cached property', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:knows', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)['http://xmlns.com/foaf/0.1/knows']);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing the reverse of a cached property', () => {
      let result;
      beforeEach(() => result = resolver.resolve('friendOf', pathData));

      it('extends the path without a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBeFalsy();
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });
  });
});
