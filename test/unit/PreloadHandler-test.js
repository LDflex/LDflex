import PreloadHandler from '../../src/PreloadHandler';
import { createQueryEngine, deindent } from '../util';
import { namedNode, literal, blankNode } from '@rdfjs/data-model';

describe('a PreloadHandler instance', () => {
  const variables = ['?resultVar', '?preload_0', '?preload_1'];
  const results = [
    [namedNode('http://example.org/#Alice'), literal('abc'), undefined],
    [namedNode('http://example.org/#Alice'), literal('def'), undefined],
    [namedNode('http://example.org/#Robby'), literal('ghi'), undefined],
    [namedNode('http://example.org/#Carol'), undefined, literal('jkl')],
    [namedNode('http://example.org/#Alice'), undefined, literal('uvw')],
    [namedNode('http://example.org/#Alice'), undefined, literal('xyz')],
    [literal('http://example.org/#Alice'), undefined, undefined],
    [blankNode('x'), undefined, undefined],
  ];
  const queryEngine = createQueryEngine(variables, results, true);
  const pathData = {
    extendPath: jest.fn(data => data),
    settings: { queryEngine },
  };
  const pathProxy = {
    p1: { predicate: Promise.resolve(namedNode('http://p.example/#1')) },
    p2: { predicate: Promise.resolve(namedNode('http://p.example/#2')) },
    sparql: Promise.resolve(deindent(`
      SELECT ?resultVar WHERE {
        <s1> <p1> ?resultVar.
      }`)),
  };

  let handler = new PreloadHandler();
  let preload;
  beforeEach(() => {
    handler = new PreloadHandler();
    preload = handler.handle(pathData, pathProxy);
  });

  it('returns a function when handle is called', () => {
    expect(preload).toBeInstanceOf(Function);
  });

  describe('when the function is given an invalid SPARQL query', () => {
    it('throws an error', async () => {
      const sparql = 'CONSTRUCT WHERE { ?s ?p ?o }';
      await expect(handler.handle(null, { ...pathProxy, sparql })('p1'))
        .rejects.toThrow('Unexpected path query: CONSTRUCT WHERE { ?s ?p ?o }');
    });
  });

  describe('when the function is called without parameters', () => {
    let result;
    beforeEach(async () => result = await preload());

    it('returns the original path', () => {
      expect(result).toBe(pathProxy);
    });

    it('does not execute any queries', () => {
      expect(queryEngine.execute).not.toHaveBeenCalled();
    });
  });

  describe('when the function is called with two properties', () => {
    let result;
    beforeEach(async () => result = await preload('p1', 'p2'));

    it('returns the original path', () => {
      expect(result).toBe(pathProxy);
    });

    it('executes the correct preload query', () => {
      expect(queryEngine.execute).toHaveBeenCalledTimes(1);
      expect(queryEngine.execute).toHaveBeenCalledWith(deindent(`
        SELECT ?resultVar ?preload_0 ?preload_1 WHERE {
          <s1> <p1> ?resultVar.
          OPTIONAL {
            { ?resultVar <http://p.example/#1> ?preload_0. }
            UNION
            { ?resultVar <http://p.example/#2> ?preload_1. }
          }
        }`));
    });

    it('puts cached results in resultsCache', () => {
      expect(pathData).toHaveProperty('resultsCache');
      expect(pathData.resultsCache).toBeInstanceOf(Array);
    });

    it('caches all unique subjects as paths', () => {
      const { resultsCache } = pathData;
      expect(resultsCache).toHaveLength(5);
      expect(resultsCache[0]).toHaveProperty('subject', namedNode('http://example.org/#Alice'));
      expect(resultsCache[1]).toHaveProperty('subject', namedNode('http://example.org/#Robby'));
      expect(resultsCache[2]).toHaveProperty('subject', namedNode('http://example.org/#Carol'));
      expect(resultsCache[3]).toHaveProperty('subject', literal('http://example.org/#Alice'));
      expect(resultsCache[4]).toHaveProperty('subject', blankNode('x'));
    });

    it('adds property caches to each result path', () => {
      const { resultsCache } = pathData;
      expect(resultsCache).toHaveLength(5);

      expect(resultsCache[0]).toHaveProperty('propertyCache');
      expect(resultsCache[0].propertyCache).toEqual({
        'http://p.example/#1': [
          { subject: literal('abc') },
          { subject: literal('def') },
        ],
        'http://p.example/#2': [
          { subject: literal('uvw') },
          { subject: literal('xyz') },
        ],
      });

      expect(resultsCache[1]).toHaveProperty('propertyCache');
      expect(resultsCache[1].propertyCache).toEqual({
        'http://p.example/#1': [
          { subject: literal('ghi') },
        ],
        'http://p.example/#2': [],
      });

      expect(resultsCache[2]).toHaveProperty('propertyCache');
      expect(resultsCache[2].propertyCache).toEqual({
        'http://p.example/#1': [],
        'http://p.example/#2': [
          { subject: literal('jkl') },
        ],
      });

      expect(resultsCache[3]).toHaveProperty('propertyCache');
      expect(resultsCache[3].propertyCache).toEqual({
        'http://p.example/#1': [],
        'http://p.example/#2': [],
      });

      expect(resultsCache[4]).toHaveProperty('propertyCache');
      expect(resultsCache[4].propertyCache).toEqual({
        'http://p.example/#1': [],
        'http://p.example/#2': [],
      });
    });
  });
});
