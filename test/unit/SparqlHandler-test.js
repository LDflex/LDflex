import SparqlHandler from '../../src/SparqlHandler';

import { deindent } from '../util';

describe('a SparqlHandler instance', () => {
  let handler;
  beforeAll(() => handler = new SparqlHandler());

  it('errors with empty mutationExpressions and when no pathExpression is present', async () => {
    const mutationExpressions = [];
    const path = { toString: () => 'path' };

    await expect(handler.execute(path, { mutationExpressions: mutationExpressions })).rejects
      .toThrow(new Error('path has no pathExpression property'));
  });

  it('errors when no pathExpression is present', async () => {
    const path = { toString: () => 'path' };

    await expect(handler.execute(path, {})).rejects
      .toThrow(new Error('path has no pathExpression property'));
  });

  describe('with a pathExpression', () => {
    it('errors with a path of length 0', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
      ];
      const path = { toString: () => 'path' };

      await expect(handler.execute(path, { pathExpression })).rejects
        .toThrow(new Error('path should at least contain a subject and a predicate'));
    });

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
      ];
      const path = { property: 'p1' };

      expect(await handler.execute(path, { pathExpression })).toEqual(deindent(`
      SELECT ?p1 WHERE {
        <https://example.org/#me> <https://ex.org/p1> ?p1.
      }`));
    });

    it('resolves a path of length 3', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
        { predicate: 'https://ex.org/p2' },
        { predicate: 'https://ex.org/p3' },
      ];
      const path = { property: 'p3' };

      expect(await handler.execute(path, { pathExpression })).toEqual(deindent(`
      SELECT ?p3 WHERE {
        <https://example.org/#me> <https://ex.org/p1> ?v0.
        ?v0 <https://ex.org/p2> ?v1.
        ?v1 <https://ex.org/p3> ?p3.
      }`));
    });

    it('resolves a path with an property name ending in a non-word', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
      ];
      const path = { property: '/x/' };

      expect(await handler.execute(path, { pathExpression })).toEqual(deindent(`
      SELECT ?result WHERE {
        <https://example.org/#me> <https://ex.org/p1> ?result.
      }`));
    });
  });

  describe('with mutationExpressions', () => {
    describe('with one INSERT expression', () => {
      it('resolves with domain of length 0 and range of length of 0', async () => {
        const mutationExpressions = [
          {
            mutationType: 'INSERT',
            domainExpression: [{ subject: 'https://example.org/#D0' }],
            predicate: 'https://example.org/p',
            rangeExpression: [{ subject: 'https://example.org/#R0' }],
          },
        ];

        await expect(await handler.execute({}, { mutationExpressions: mutationExpressions })).toEqual(deindent(`
      INSERT DATA {
        <https://example.org/#D0> <https://example.org/p> <https://example.org/#R0>
      }`));
      });

      it('resolves with domain of length 0 and range of length of 0 with literal', async () => {
        const mutationExpressions = [
          {
            mutationType: 'INSERT',
            domainExpression: [{ subject: 'https://example.org/#D0' }],
            predicate: 'https://example.org/p',
            rangeExpression: [{ subject: '"Ruben"' }],
          },
        ];

        await expect(await handler.execute({}, { mutationExpressions: mutationExpressions })).toEqual(deindent(`
      INSERT DATA {
        <https://example.org/#D0> <https://example.org/p> "Ruben"
      }`));
      });

      it('resolves with domain of length 2 and range of length of 0', async () => {
        const mutationExpressions = [
          {
            mutationType: 'INSERT',
            domainExpression: [
              { subject: 'https://example.org/#D0' },
              { predicate: 'https://example.org/#Dp1' },
              { predicate: 'https://example.org/#Dp2' },
            ],
            predicate: 'https://example.org/p',
            rangeExpression: [{ subject: 'https://example.org/#R0' }],
          },
        ];

        await expect(await handler.execute({}, { mutationExpressions: mutationExpressions })).toEqual(deindent(`
      INSERT {
        ?Dp2 <https://example.org/p> <https://example.org/#R0>
      } WHERE {
        <https://example.org/#D0> <https://example.org/#Dp1> ?v0.
        ?v0 <https://example.org/#Dp2> ?Dp2.
      }`));
      });

      it('resolves with domain of length 1 with exotic predicate and range of length of 0', async () => {
        const mutationExpressions = [
          {
            mutationType: 'INSERT',
            domainExpression: [
              { subject: 'https://example.org/#D0' },
              { predicate: 'https://example.org/#' },
            ],
            predicate: 'https://example.org/p',
            rangeExpression: [{ subject: 'https://example.org/#R0' }],
          },
        ];

        await expect(await handler.execute({}, { mutationExpressions: mutationExpressions })).toEqual(deindent(`
      INSERT {
        ?result <https://example.org/p> <https://example.org/#R0>
      } WHERE {
        <https://example.org/#D0> <https://example.org/#> ?result.
      }`));
      });

      it('resolves with domain of length 0 and range of length of 2', async () => {
        const mutationExpressions = [
          {
            mutationType: 'INSERT',
            domainExpression: [{ subject: 'https://example.org/#D0' }],
            predicate: 'https://example.org/p',
            rangeExpression: [
              { subject: 'https://example.org/#R0' },
              { predicate: 'https://example.org/#Rp1' },
              { predicate: 'https://example.org/#Rp2' },
            ],
          },
        ];

        await expect(await handler.execute({}, { mutationExpressions: mutationExpressions })).toEqual(deindent(`
      INSERT {
        <https://example.org/#D0> <https://example.org/p> ?Rp2
      } WHERE {
        <https://example.org/#R0> <https://example.org/#Rp1> ?v0.
        ?v0 <https://example.org/#Rp2> ?Rp2.
      }`));
      });

      it('resolves with domain of length 2 and range of length of 2', async () => {
        const mutationExpressions = [
          {
            mutationType: 'INSERT',
            domainExpression: [
              { subject: 'https://example.org/#D0' },
              { predicate: 'https://example.org/#Dp1' },
              { predicate: 'https://example.org/#Dp2' },
            ],
            predicate: 'https://example.org/p',
            rangeExpression: [
              { subject: 'https://example.org/#R0' },
              { predicate: 'https://example.org/#Rp1' },
              { predicate: 'https://example.org/#Rp2' },
            ],
          },
        ];

        await expect(await handler.execute({}, { mutationExpressions: mutationExpressions })).toEqual(deindent(`
      INSERT {
        ?Dp2 <https://example.org/p> ?Rp2
      } WHERE {
        <https://example.org/#D0> <https://example.org/#Dp1> ?v0.
        ?v0 <https://example.org/#Dp2> ?Dp2.
        <https://example.org/#R0> <https://example.org/#Rp1> ?v0.
        ?v0 <https://example.org/#Rp2> ?Rp2.
      }`));
      });
    });

    describe('with one DELETE expression', () => {
      it('resolves with domain of length 0 and range of length of 0', async () => {
        const mutationExpressions = [
          {
            mutationType: 'DELETE',
            domainExpression: [{ subject: 'https://example.org/#D0' }],
            predicate: 'https://example.org/p',
            rangeExpression: [{ subject: 'https://example.org/#R0' }],
          },
        ];

        await expect(await handler.execute({}, { mutationExpressions: mutationExpressions })).toEqual(deindent(`
      DELETE DATA {
        <https://example.org/#D0> <https://example.org/p> <https://example.org/#R0>
      }`));
      });
    });

    describe('with one DELETE expression without range', () => {
      it('resolves with domain of length 0 and range of length of 0', async () => {
        const mutationExpressions = [
          {
            mutationType: 'DELETE',
            domainExpression: [{ subject: 'https://example.org/#D0' }, { predicate: 'https://example.org/#Dp1' }],
          },
        ];

        await expect(await handler.execute({}, { mutationExpressions: mutationExpressions })).toEqual(deindent(`
      DELETE {
        <https://example.org/#D0> <https://example.org/#Dp1> ?Dp1
      } WHERE {
        <https://example.org/#D0> <https://example.org/#Dp1> ?Dp1.
      }`));
      });
    });

    describe('with multiple expressions', () => {
      it('resolves with queries separated by semicolons', async () => {
        const mutationExpressions = [
          {
            mutationType: 'INSERT',
            domainExpression: [
              { subject: 'https://example.org/#D0' },
              { predicate: 'https://example.org/#Dp1' },
              { predicate: 'https://example.org/#Dp2' },
            ],
            predicate: 'https://example.org/p',
            rangeExpression: [
              { subject: 'https://example.org/#R0' },
              { predicate: 'https://example.org/#Rp1' },
              { predicate: 'https://example.org/#Rp2' },
            ],
          },
          {
            mutationType: 'DELETE',
            domainExpression: [{ subject: 'https://example.org/#D0' }],
            predicate: 'https://example.org/p',
            rangeExpression: [{ subject: 'https://example.org/#R0' }],
          },
          {
            mutationType: 'INSERT',
            domainExpression: [{ subject: 'https://example.org/#D0' }],
            predicate: 'https://example.org/p',
            rangeExpression: [{ subject: 'https://example.org/#R0' }],
          },
        ];

        await expect(await handler.execute({}, { mutationExpressions: mutationExpressions })).toEqual(deindent(`
      INSERT {
        ?Dp2 <https://example.org/p> ?Rp2
      } WHERE {
        <https://example.org/#D0> <https://example.org/#Dp1> ?v0.
        ?v0 <https://example.org/#Dp2> ?Dp2.
        <https://example.org/#R0> <https://example.org/#Rp1> ?v0.
        ?v0 <https://example.org/#Rp2> ?Rp2.
      }
      ;
      DELETE DATA {
        <https://example.org/#D0> <https://example.org/p> <https://example.org/#R0>
      }
      ;
      INSERT DATA {
        <https://example.org/#D0> <https://example.org/p> <https://example.org/#R0>
      }`));
      });
    });
  });
});
