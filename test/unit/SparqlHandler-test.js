import SparqlHandler from '../../src/SparqlHandler';
import { namedNode, literal, blankNode, defaultGraph, variable } from '@rdfjs/data-model';

import { deindent } from '../util';

describe('a SparqlHandler instance', () => {
  let handler;
  beforeAll(() => {
    handler = new SparqlHandler();
  });

  it('errors with empty mutationExpressions and when no pathExpression is present', async () => {
    const mutationExpressions = [];
    const pathData = { toString: () => 'path' };

    await expect(handler.handle(pathData, { mutationExpressions })).rejects
      .toThrow(new Error('path has no pathExpression property'));
  });

  it('errors when no pathExpression is present', async () => {
    const pathData = { toString: () => 'path' };

    await expect(handler.handle(pathData, {})).rejects
      .toThrow(new Error('path has no pathExpression property'));
  });

  describe('when converting a term to string', () => {
    it('should convert a NamedNode', async () => {
      await expect(handler.termToString(namedNode('http://example.org')))
        .toEqual('<http://example.org>');
    });

    it('should convert a NamedNode with special characters', async () => {
      await expect(handler.termToString(namedNode('urn:ab:c\u0000\u0001\ud835\udc00')))
        .toEqual('<urn:ab:c\\u0000\\u0001\\U0001d400>');
    });

    it('should convert a Literal', async () => {
      await expect(handler.termToString(literal('abc')))
        .toEqual('"abc"');
    });

    it('should convert a Literal that should be escaped', async () => {
      await expect(handler.termToString(literal('a\'\\"\n\r\t\f\bbc')))
        .toEqual('"a\'\\\\\\"\\n\\r\\t\\f\\bbc"');
    });

    it('should convert a Literal with a type', async () => {
      await expect(handler.termToString(literal('abc', namedNode('http://example.org/#type'))))
        .toEqual('"abc"^^<http://example.org/#type>');
    });

    it('should convert a Literal with a language', async () => {
      await expect(handler.termToString(literal('abc', 'en-us')))
        .toEqual('"abc"@en-us');
    });

    it('should convert a BlankNode', async () => {
      await expect(handler.termToString(blankNode('abc')))
        .toEqual('_:abc');
    });

    it('should error on DefaultGraph', async () => {
      await expect(() => handler.termToString(defaultGraph()))
        .toThrow(new Error('Could not convert a term of type DefaultGraph'));
    });

    it('should error on Variable', async () => {
      await expect(() => handler.termToString(variable('v')))
        .toThrow(new Error('Could not convert a term of type Variable'));
    });
  });

  describe('with a pathExpression', () => {
    it('errors with a path of length 0', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
      ];
      const pathData = { toString: () => 'path' };

      await expect(handler.handle(pathData, { pathExpression })).rejects
        .toThrow(new Error('path should at least contain a subject and a predicate'));
    });

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
      ];
      const pathData = { property: 'p1' };

      expect(await handler.handle(pathData, { pathExpression })).toEqual(deindent(`
        SELECT ?p1 WHERE {
          <https://example.org/#me> <https://ex.org/p1> ?p1.
        }`));
    });

    it('resolves a path of length 3', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
        { predicate: namedNode('https://ex.org/p2') },
        { predicate: namedNode('https://ex.org/p3') },
      ];
      const pathData = { property: 'p3' };

      expect(await handler.handle(pathData, { pathExpression })).toEqual(deindent(`
        SELECT ?p3 WHERE {
          <https://example.org/#me> <https://ex.org/p1> ?v0.
          ?v0 <https://ex.org/p2> ?v1.
          ?v1 <https://ex.org/p3> ?p3.
        }`));
    });

    it('resolves a path with an property name ending in a non-word', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
      ];
      const pathData = { property: '/x/' };

      expect(await handler.handle(pathData, { pathExpression })).toEqual(deindent(`
        SELECT ?result WHERE {
          <https://example.org/#me> <https://ex.org/p1> ?result.
        }`));
    });

    it('skolemizes blank-node subjects', async () => {
      const pathExpression = [
        { subject: blankNode('b1') },
        { predicate: namedNode('https://ex.org/p1') },
      ];
      const pathData = { property: 'p1' };

      expect(await handler.handle(pathData, { pathExpression })).toMatch(
        /<urn:ldflex:sk\d+> <https:\/\/ex.org\/p1> \?p1\./);
      expect(await handler.handle(pathData, { pathExpression })).toMatch(
        /<urn:ldflex:sk\d+> <https:\/\/ex.org\/p1> \?p1\./);
    });

    it('supports ORDER BY with one variable', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
        { predicate: namedNode('https://ex.org/p2'), sort: 'ASC' },
      ];

      const pathData = { property: 'p2' };
      expect(await handler.handle(pathData, { pathExpression })).toEqual(deindent(`
        SELECT ?v0 WHERE {
          <https://example.org/#me> <https://ex.org/p1> ?v0.
          ?v0 <https://ex.org/p2> ?p2.
        }
        ORDER BY ASC(?p2)`));
    });

    it('supports ORDER BY with two variables', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
        { predicate: namedNode('https://ex.org/p2'), sort: 'ASC' },
        { predicate: namedNode('https://ex.org/p3'), sort: 'ASC' },
      ];

      const pathData = { property: 'p3' };
      expect(await handler.handle(pathData, { pathExpression })).toEqual(deindent(`
        SELECT ?v0 WHERE {
          <https://example.org/#me> <https://ex.org/p1> ?v0.
          ?v0 <https://ex.org/p2> ?v1.
          ?v0 <https://ex.org/p3> ?p3.
        }
        ORDER BY ASC(?v1) ASC(?p3)`));
    });

    it('supports reversed predicates', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1'), reverse: true },
        { predicate: namedNode('https://ex.org/p2') },
      ];

      const pathData = { property: 'p2' };
      expect(await handler.handle(pathData, { pathExpression })).toEqual(deindent(`
        SELECT ?p2 WHERE {
          ?v0 <https://ex.org/p1> <https://example.org/#me>.
          ?v0 <https://ex.org/p2> ?p2.
        }`));
    });

    it('supports fixed values', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
        { predicate: namedNode('https://ex.org/p2'), values: [namedNode('https://ex.org/o1'), namedNode('https://ex.org/o2')] },
      ];

      const pathData = { property: 'p2' };
      expect(await handler.handle(pathData, { pathExpression })).toEqual(deindent(`
       SELECT ?v0 WHERE {
         <https://example.org/#me> <https://ex.org/p1> ?v0.
         ?v0 <https://ex.org/p2> <https://ex.org/o1>, <https://ex.org/o2>.
       }`));
    });

    it('errors on static triples in a query', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1'), values: [namedNode('https://ex.org/o1'), namedNode('https://ex.org/o2')] },
        { predicate: namedNode('https://ex.org/p2') },
      ];

      const pathData = { property: 'p2' };
      await expect(handler.handle(pathData, { pathExpression })).rejects
        .toEqual(new Error('Specifying fixed values is not allowed here'));
    });

    it('supports reversed fixed values', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
        { predicate: namedNode('https://ex.org/p2'), values: [namedNode('https://ex.org/o1'), namedNode('https://ex.org/o2')], reverse: true },
      ];

      const pathData = { property: 'p2' };
      expect(await handler.handle(pathData, { pathExpression })).toEqual(deindent(`
       SELECT ?v0 WHERE {
         <https://example.org/#me> <https://ex.org/p1> ?v0.
         <https://ex.org/o1> <https://ex.org/p2> ?v0.
         <https://ex.org/o2> <https://ex.org/p2> ?v0.
       }`));
    });
  });

  describe('with mutationExpressions', () => {
    describe('with one INSERT expression', () => {
      it('resolves with domain of length 0 and range of length 0', async () => {
        const mutationExpressions = [
          {
            mutationType: 'INSERT',
            conditions: [{ subject: namedNode('https://example.org/#D0') }],
            predicateObjects: [{
              predicate: namedNode('https://example.org/p'),
              objects: [namedNode('https://example.org/#R0')],
            }],
          },
        ];

        expect(await handler.handle({}, { mutationExpressions })).toEqual(deindent(`
          INSERT DATA {
            <https://example.org/#D0> <https://example.org/p> <https://example.org/#R0>.
          }`));
      });

      it('resolves with domain of length 0 and range of length 0 with literal', async () => {
        const mutationExpressions = [
          {
            mutationType: 'INSERT',
            conditions: [{ subject: namedNode('https://example.org/#D0') }],
            predicateObjects: [{
              predicate: namedNode('https://example.org/p'),
              objects: [literal('Ruben')],
            }],
          },
        ];

        expect(await handler.handle({}, { mutationExpressions })).toEqual(deindent(`
          INSERT DATA {
            <https://example.org/#D0> <https://example.org/p> "Ruben".
          }`));
      });

      it('resolves with domain of length 0 and range of length 0 with multiple terms', async () => {
        const mutationExpressions = [
          {
            mutationType: 'INSERT',
            conditions: [{ subject: namedNode('https://example.org/#D0') }],
            predicateObjects: [{
              predicate: namedNode('https://example.org/p'),
              objects: [
                namedNode('https://example.org/#R0'),
                literal('Ruben'),
                literal('Other'),
              ],
            }],
          },
        ];

        expect(await handler.handle({}, { mutationExpressions })).toEqual(deindent(`
          INSERT DATA {
            <https://example.org/#D0> <https://example.org/p> <https://example.org/#R0>, "Ruben", "Other".
          }`));
      });

      it('resolves with domain of length 2 and range of length 0', async () => {
        const mutationExpressions = [
          {
            mutationType: 'INSERT',
            conditions: [
              { subject: namedNode('https://example.org/#D0') },
              { predicate: namedNode('https://example.org/#Dp1') },
              { predicate: namedNode('https://example.org/#Dp2') },
            ],
            predicateObjects: [{
              predicate: namedNode('https://example.org/p'),
              objects: [namedNode('https://example.org/#R0')],
            }],
          },
        ];

        expect(await handler.handle({}, { mutationExpressions })).toEqual(deindent(`
          INSERT {
            ?Dp2 <https://example.org/p> <https://example.org/#R0>.
          } WHERE {
            <https://example.org/#D0> <https://example.org/#Dp1> ?v0.
            ?v0 <https://example.org/#Dp2> ?Dp2.
          }`));
      });

      it('resolves with domain of length 1 with exotic predicate and range of length 0', async () => {
        const mutationExpressions = [
          {
            mutationType: 'INSERT',
            conditions: [
              { subject: namedNode('https://example.org/#D0') },
              { predicate: namedNode('https://example.org/#') },
            ],
            predicateObjects: [{
              predicate: namedNode('https://example.org/p'),
              objects: [namedNode('https://example.org/#R0')],
            }],
          },
        ];

        expect(await handler.handle({}, { mutationExpressions })).toEqual(deindent(`
          INSERT {
            ?result <https://example.org/p> <https://example.org/#R0>.
          } WHERE {
            <https://example.org/#D0> <https://example.org/#> ?result.
          }`));
      });

      it('resolves with domain of length 2 and range of length 0 with reversed predicates', async () => {
        const mutationExpressions = [
          {
            mutationType: 'INSERT',
            conditions: [
              { subject: namedNode('https://example.org/#D0') },
              { predicate: namedNode('https://example.org/#Dp1'), reverse: true },
              { predicate: namedNode('https://example.org/#Dp2') },
            ],
            predicateObjects: [{
              predicate: namedNode('https://example.org/p'),
              reverse: true,
              objects: [namedNode('https://example.org/#R0'), namedNode('https://example.org/#R1')],
            }],
          },
        ];

        expect(await handler.handle({}, { mutationExpressions })).toEqual(deindent(`
          INSERT {
            <https://example.org/#R0> <https://example.org/p> ?Dp2.
            <https://example.org/#R1> <https://example.org/p> ?Dp2.
          } WHERE {
            ?v0 <https://example.org/#Dp1> <https://example.org/#D0>.
            ?v0 <https://example.org/#Dp2> ?Dp2.
          }`));
      });
    });

    describe('with one INSERT expression that has a range that should be escaped', () => {
      it('resolves with domain of length 0 and range of length 0', async () => {
        const mutationExpressions = [
          {
            mutationType: 'INSERT',
            conditions: [{ subject: namedNode('https://example.org/#D0') }],
            predicateObjects: [{
              predicate: namedNode('https://example.org/p'),
              objects: [literal('a"b')],
            }],
          },
        ];

        expect(await handler.handle({}, { mutationExpressions })).toEqual(deindent(`
          INSERT DATA {
            <https://example.org/#D0> <https://example.org/p> "a\\"b".
          }`));
      });
    });

    describe('with one DELETE expression', () => {
      it('resolves with domain of length 0 and range of length 0', async () => {
        const mutationExpressions = [
          {
            mutationType: 'DELETE',
            conditions: [{ subject: namedNode('https://example.org/#D0') }],
            predicateObjects: [{
              predicate: namedNode('https://example.org/p'),
              objects: [namedNode('https://example.org/#R0')],
            }],
          },
        ];

        expect(await handler.handle({}, { mutationExpressions })).toEqual(deindent(`
          DELETE DATA {
            <https://example.org/#D0> <https://example.org/p> <https://example.org/#R0>.
          }`));
      });
    });

    it('resolves with domain of length 0 and range of length 0 with multiple terms', async () => {
      const mutationExpressions = [
        {
          mutationType: 'DELETE',
          conditions: [{ subject: namedNode('https://example.org/#D0') }],
          predicateObjects: [{
            predicate: namedNode('https://example.org/p'),
            objects: [
              namedNode('https://example.org/#R0'),
              literal('Ruben'),
              literal('Other'),
            ],
          }],
        },
      ];

      expect(await handler.handle({}, { mutationExpressions })).toEqual(deindent(`
        DELETE DATA {
          <https://example.org/#D0> <https://example.org/p> <https://example.org/#R0>, "Ruben", "Other".
        }`));
    });

    describe('with one DELETE expression without range', () => {
      it('resolves with domain of length 0 and range of length 0', async () => {
        const mutationExpressions = [
          {
            mutationType: 'DELETE',
            conditions: [
              { subject: namedNode('https://example.org/#D0') },
            ],
            predicateObjects: [
              { predicate: namedNode('https://example.org/#Dp1'), objects: null },
            ],
          },
        ];

        expect(await handler.handle({}, { mutationExpressions })).toEqual(deindent(`
          DELETE DATA {
            <https://example.org/#D0> <https://example.org/#Dp1> ?Dp1.
          }`));
      });
    });

    it('returns an empty query if there are no applicable objects', async () => {
      const mutationExpressions = [{ predicateObjects: [] }];
      expect(await handler.handle({}, { mutationExpressions })).toEqual('');
    });
  });

  describe('#createVar', () => {
    it('returns a default value when no suggestion is given', () => {
      const variableScope = {};
      const queryVar = handler.createVar(undefined, variableScope);
      expect(queryVar).toEqual('?result');
      expect(variableScope).toEqual({ '?result': true });
    });

    it('returns the suggestion for an empty scope', () => {
      const variableScope = {};
      const queryVar = handler.createVar('a', variableScope);
      expect(queryVar).toEqual('?a');
      expect(variableScope).toEqual({ '?a': true });
    });

    it('returns the suggestion for a scope without matches', () => {
      const variableScope = { '?b': true };
      const queryVar = handler.createVar('a', variableScope);
      expect(queryVar).toEqual('?a');
      expect(variableScope).toEqual({ '?b': true, '?a': true });
    });

    it('returns an incremented label for a scope with 1 match', () => {
      const variableScope = { '?a': true };
      const queryVar = handler.createVar('a', variableScope);
      expect(queryVar).toEqual('?a_0');
      expect(variableScope).toEqual({ '?a': true, '?a_0': true });
    });

    it('returns an incremented label for a scope with 3 matches', () => {
      const variableScope = { '?a': true, '?a_0': true, '?a_1': true, '?a_2': true };
      const queryVar = handler.createVar('a', variableScope);
      expect(queryVar).toEqual('?a_3');
      expect(variableScope).toEqual({ '?a': true, '?a_0': true, '?a_1': true, '?a_2': true, '?a_3': true });
    });
  });

  describe('expressionToTriplePatterns', () => {
    it('returns filters when given closestLanguageRanges', () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
      ];
      const result = handler.expressionToTriplePatterns(pathExpression, '?subject', {}, ['en']);
      expect(result.languageFilters[0].languageRanges[0]).toBe('en');

      const result2 = handler.expressionToTriplePatterns(pathExpression, '?subject');
      expect(result2.languageFilters.length).toBe(0);
    });
  });
});
