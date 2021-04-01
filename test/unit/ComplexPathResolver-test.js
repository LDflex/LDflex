import ComplexPathResolver from '../../src/ComplexPathResolver';
import context from '../context';
import { namedNode } from '@rdfjs/data-model';

describe('a ComplexPathResolver instance', () => {
  let resolver;
  beforeAll(() => resolver = new ComplexPathResolver());

  it('does not support strings that are not complext paths', () => {
    expect(resolver.supports('foo')).toBe(false);
  });

  it('does not support symbols', () => {
    expect(resolver.supports(Symbol('foo'))).toBe(false);
  });

  it('does not support single prefixed IRI', () => {
    expect(resolver.supports('ex:Jesse')).toBe(false);
  });

  it('does not support single IRI', () => {
    expect(resolver.supports('http://example.org#Jesse')).toBe(false);
    expect(resolver.supports('http://example.org/')).toBe(false);
    expect(resolver.supports('http://example.org/path/')).toBe(false);
  });

  it('supports an IRI wrapped in angle brackets', () => {
    expect(resolver.supports('<http://example.org#Jesse>')).toBe(true);
  });

  it('supports prefixed IRI\'s with path modifiers', () => {
    expect(resolver.supports('foaf:friend*')).toBe(true);
    expect(resolver.supports('foaf:friend+')).toBe(true);
    expect(resolver.supports('foaf:friend?')).toBe(true);
    expect(resolver.supports('^foaf:friend')).toBe(true);
  });

  it('supports full IRI\'s with path modifiers', () => {
    expect(resolver.supports('<http://xmlns.com/foaf/0.1/friend>*')).toBe(true);
    expect(resolver.supports('<http://xmlns.com/foaf/0.1/friend>+')).toBe(true);
    expect(resolver.supports('<http://xmlns.com/foaf/0.1/friend>?')).toBe(true);
    expect(resolver.supports('^<http://xmlns.com/foaf/0.1/friend>')).toBe(true);
  });

  it('supports sequence and alt path modifiers', () => {
    expect(resolver.supports('foaf:friend/foaf:supervisor')).toBe(true);
    expect(resolver.supports('<http://xmlns.com/foaf/0.1/friend>/foaf:supervisor')).toBe(true);
    expect(resolver.supports('foaf:friend/<http://xmlns.com/foaf/0.1/supervisor>')).toBe(true);
    expect(resolver.supports('<http://xmlns.com/foaf/0.1/friend>/<http://xmlns.com/foaf/0.1/supervisor>')).toBe(true);
    expect(resolver.supports('foaf:friend|foaf:supervisor')).toBe(true);
    expect(resolver.supports('<http://xmlns.com/foaf/0.1/friend>|foaf:supervisor')).toBe(true);
    expect(resolver.supports('foaf:friend|<http://xmlns.com/foaf/0.1/supervisor>')).toBe(true);
    expect(resolver.supports('<http://xmlns.com/foaf/0.1/friend>|<http://xmlns.com/foaf/0.1/supervisor>')).toBe(true);
  });
});

describe('Error handling on complex paths without prefixes defined', () => {
  let resolver;
  beforeAll(() => resolver = new ComplexPathResolver());

  it('does not support strings that are not complext paths', async () => {
    await expect(() => resolver.expandProperty('foaf:friend*')).rejects
      .toThrow('The Complex Path Resolver cannot expand the \'foaf:friend*\' path');
  });
});

describe('a ComplexPathResolver instance with a context', () => {
  let resolver;
  beforeAll(() => resolver = new ComplexPathResolver(context));

  describe('expanding a property', () => {
    it('expands knows to foaf:knows*', async () => {
      expect(await resolver.expandProperty('foaf:knows*'))
        .toEqual({ termType: 'path', value: '<http://xmlns.com/foaf/0.1/knows>*' });
    });

    it('expands knows to ^foaf:knows', async () => {
      expect(await resolver.expandProperty('^foaf:knows'))
        .toEqual({ termType: 'path', value: '^<http://xmlns.com/foaf/0.1/knows>' });
    });

    it('expands knows to foaf:knows*/foaf:friend+', async () => {
      expect(await resolver.expandProperty('foaf:knows*/foaf:friend+'))
        .toEqual({ termType: 'path', value: '<http://xmlns.com/foaf/0.1/knows>*/<http://xmlns.com/foaf/0.1/friend>+' });
    });

    it('expands knows to foaf:knows*/foaf:friend+/foaf:knows?', async () => {
      expect(await resolver.expandProperty('foaf:knows*/foaf:friend+/foaf:knows?'))
        .toEqual({ termType: 'path', value: '<http://xmlns.com/foaf/0.1/knows>*/<http://xmlns.com/foaf/0.1/friend>+/<http://xmlns.com/foaf/0.1/knows>?' });
    });

    it('errors when expanding an unknown property', async () => {
      await expect(resolver.expandProperty('other')).rejects
        .toThrow(new Error('The Complex Path Resolver cannot expand the \'other\' path'));
    });

    it('errors when expanding a variable property', async () => {
      await expect(resolver.expandProperty('?p')).rejects
        .toThrow(new Error('The Complex Path Resolver cannot expand the \'?p\' path'));
    });
  });

  describe('applying unary operators to single IRI', () => {
    it('*', async () => {
      expect(await resolver.expandProperty('<http://xmlns.com/foaf/0.1/knows>*'))
        .toEqual({ termType: 'path', value: '<http://xmlns.com/foaf/0.1/knows>*' });
    });

    it('+', async () => {
      expect(await resolver.expandProperty('<http://xmlns.com/foaf/0.1/knows>+'))
        .toEqual({ termType: 'path', value: '<http://xmlns.com/foaf/0.1/knows>+' });
    });

    it('?', async () => {
      expect(await resolver.expandProperty('<http://xmlns.com/foaf/0.1/knows>?'))
        .toEqual({ termType: 'path', value: '<http://xmlns.com/foaf/0.1/knows>?' });
    });

    it('^', async () => {
      expect(await resolver.expandProperty('^<http://xmlns.com/foaf/0.1/knows>'))
        .toEqual({ termType: 'path', value: '^<http://xmlns.com/foaf/0.1/knows>' });
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
      }, {
        '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>*': [
          { subject: namedNode('http://people.example/#Alice') },
          { subject: namedNode('http://people.example/#Bob') },
          { subject: namedNode('http://people.example/#Charlie') },
        ],
      }, {
        '<http://xmlns.com/foaf/0.1/knows>|<http://xmlns.com/foaf/0.1/friend>*': [
          { subject: namedNode('http://people.example/#A') },
        ],
      }, {
        '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>?': [
          { subject: namedNode('http://people.example/#B') },
        ],
      }, {
        '<http://xmlns.com/foaf/0.1/knows>|<http://xmlns.com/foaf/0.1/friend>?': [
          { subject: namedNode('http://people.example/#C') },
        ],
      }, {
        '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>+': [
          { subject: namedNode('http://people.example/#D') },
        ],
      }, {
        '<http://xmlns.com/foaf/0.1/knows>|<http://xmlns.com/foaf/0.1/friend>+': [
          { subject: namedNode('http://people.example/#E') },
        ],
      }, {
        '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>*': [
          { subject: namedNode('http://people.example/#F') },
        ],
      }, {
        '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>*/<http://xmlns.com/foaf/0.1/employer>': [
          { subject: namedNode('http://people.example/#G') },
        ],
      }, {
        '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>?/<http://xmlns.com/foaf/0.1/employer>': [
          { subject: namedNode('http://people.example/#H') },
        ],
      }, {
        '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>+/<http://xmlns.com/foaf/0.1/employer>': [
          { subject: namedNode('http://people.example/#I') },
        ],
      }, {
        '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>/<http://xmlns.com/foaf/0.1/employer>': [
          { subject: namedNode('http://people.example/#J') },
        ],
      }),
    };

    describe('when accessing a non-cached property', () => {
      let result;
      beforeEach(() => result = resolver.resolve('<http://xmlns.com/foaf/0.1/givenName>', pathData));

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
      beforeEach(() => result = resolver.resolve('<http://xmlns.com/foaf/0.1/knows>', pathData));

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

    describe('when accessing a cached path foaf:knows/foaf:friend', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:knows/(foaf:friend)', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)[
            '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>'
          ]);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing a cached path foaf:knows/(foaf:friend*)', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:knows/(foaf:friend*)', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)[
            '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>*'
          ]);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing a cached path foaf:knows/(foaf:friend?)', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:knows/(foaf:friend?)', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)[
            '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>?'
          ]);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing a cached path foaf:knows/(foaf:friend+)', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:knows/(foaf:friend+)', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)[
            '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>+'
          ]);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing a cached path foaf:knows/foaf:friend*', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:knows/(foaf:friend*)', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)[
            '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>*'
          ]);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing a cached path foaf:knows|(foaf:friend*)', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:knows/(foaf:friend*)', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)[
            '<http://xmlns.com/foaf/0.1/knows>|<http://xmlns.com/foaf/0.1/friend>*'
          ]);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing a cached path foaf:knows|(foaf:friend?)', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:knows/(foaf:friend?)', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)[
            '<http://xmlns.com/foaf/0.1/knows>|<http://xmlns.com/foaf/0.1/friend>?'
          ]);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing a cached path foaf:knows|(foaf:friend+)', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:knows|(foaf:friend+)', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)[
            '<http://xmlns.com/foaf/0.1/knows>|<http://xmlns.com/foaf/0.1/friend>+'
          ]);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing a cached path foaf:friend+', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:friend+', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)[
            '<http://xmlns.com/foaf/0.1/friend>+'
          ]);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing a cached path foaf:friend?', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:friend?', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)[
            '<http://xmlns.com/foaf/0.1/friend>?'
          ]);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing a cached path foaf:knows/foaf:friend/foaf:employer', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:knows/(foaf:friend)/foaf:employer', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)[
            '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>/<http://xmlns.com/foaf/0.1/employer>'
          ]);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing a cached path foaf:knows/(foaf:friend*)/foaf:employer', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:knows/(foaf:friend*)/foaf:employer', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)[
            '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>*/<http://xmlns.com/foaf/0.1/employer>'
          ]);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing a cached path foaf:knows/(foaf:friend?)/foaf:employer', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:knows/(foaf:friend?)/foaf:employer', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)[
            '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>?/<http://xmlns.com/foaf/0.1/employer>'
          ]);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });

    describe('when accessing a cached path foaf:knows/(foaf:friend+)/foaf:employer', () => {
      let result;
      beforeEach(() => result = resolver.resolve('foaf:knows/(foaf:friend+)/foaf:employer', pathData));

      it('extends the path with a results cache', async () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        await expect(args[0].resultsCache).resolves.toBe(
          (await pathData.propertyCache)[
            '<http://xmlns.com/foaf/0.1/knows>/<http://xmlns.com/foaf/0.1/friend>+/<http://xmlns.com/foaf/0.1/employer>'
          ]);
      });

      it('returns the extended path', () => {
        expect(result).toBe(extendedPath);
      });
    });
  });
});
