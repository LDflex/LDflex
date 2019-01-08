import MutationExpressionCallbackHandler from '../../src/MutationExpressionCallbackHandler';

describe('a MutationExpressionCallbackHandler instance', () => {
  let handler;

  describe('without args', () => {
    beforeAll(() => handler = new MutationExpressionCallbackHandler({ mutationType: 'INSERT', args: [] }));

    it('errors when the function is invoked without arguments', async () => {
      const path = { toString: () => 'path' };
      await expect(handler.execute(path, {})).rejects
        .toThrow(new Error('Mutation on path can not be invoked without arguments'));
    });
  });

  describe('with one raw arg', () => {
    beforeAll(() => handler = new MutationExpressionCallbackHandler({ mutationType: 'INSERT', args: ['other'] }));

    it('errors when no pathExpression is present', async () => {
      const path = { toString: () => 'path' };
      await expect(handler.execute(path, {})).rejects
        .toThrow(new Error('path has no pathExpression property'));
    });

    it('errors with a pathExpression of length 0', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
      ];
      const path = { toString: () => 'path' };

      await expect(handler.execute(path, { pathExpression })).rejects
        .toThrow(new Error('path should at least contain a subject and a predicate'));
    });

    it('errors when the pathExpression does not end with a predicate', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { nopredicate: 'https://ex.org/p1' },
      ];
      const path = { toString: () => 'path' };

      await expect(handler.execute(path, { pathExpression })).rejects
        .toThrow(new Error('Expected predicate in path'));
    });

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
      ];

      expect(await handler.execute({}, { pathExpression })).toEqual([
        {
          mutationType: 'INSERT',
          domainExpression: [{ subject: 'https://example.org/#me' }],
          predicate: 'https://ex.org/p1',
          rangeExpression: [{ subject: '"other"' }],
        },
      ]);
    });

    it('resolves a path of length 2', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
        { predicate: 'https://ex.org/p2' },
      ];

      expect(await handler.execute({}, { pathExpression })).toEqual([
        {
          mutationType: 'INSERT',
          domainExpression: [{ subject: 'https://example.org/#me' }, { predicate: 'https://ex.org/p1' }],
          predicate: 'https://ex.org/p2',
          rangeExpression: [{ subject: '"other"' }],
        },
      ]);
    });
  });

  describe('with two raw args', () => {
    beforeAll(() => handler = new MutationExpressionCallbackHandler({ mutationType: 'INSERT', args: ['other1', 'other2'] }));

    it('errors when no pathExpression is present', async () => {
      const path = { toString: () => 'path' };
      await expect(handler.execute(path, {})).rejects
        .toThrow(new Error('path has no pathExpression property'));
    });

    it('errors with a pathExpression of length 0', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
      ];
      const path = { toString: () => 'path' };

      await expect(handler.execute(path, { pathExpression })).rejects
        .toThrow(new Error('path should at least contain a subject and a predicate'));
    });

    it('errors when the pathExpression does not end with a predicate', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { nopredicate: 'https://ex.org/p1' },
      ];
      const path = { toString: () => 'path' };

      await expect(handler.execute(path, { pathExpression })).rejects
        .toThrow(new Error('Expected predicate in path'));
    });

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
      ];

      expect(await handler.execute({}, { pathExpression })).toEqual([
        {
          mutationType: 'INSERT',
          domainExpression: [{ subject: 'https://example.org/#me' }],
          predicate: 'https://ex.org/p1',
          rangeExpression: [{ subject: '"other1"' }],
        },
        {
          mutationType: 'INSERT',
          domainExpression: [{ subject: 'https://example.org/#me' }],
          predicate: 'https://ex.org/p1',
          rangeExpression: [{ subject: '"other2"' }],
        },
      ]);
    });

    it('resolves a path of length 2', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
        { predicate: 'https://ex.org/p2' },
      ];

      expect(await handler.execute({}, { pathExpression })).toEqual([
        {
          mutationType: 'INSERT',
          domainExpression: [{ subject: 'https://example.org/#me' }, { predicate: 'https://ex.org/p1' }],
          predicate: 'https://ex.org/p2',
          rangeExpression: [{ subject: '"other1"' }],
        },
        {
          mutationType: 'INSERT',
          domainExpression: [{ subject: 'https://example.org/#me' }, { predicate: 'https://ex.org/p1' }],
          predicate: 'https://ex.org/p2',
          rangeExpression: [{ subject: '"other2"' }],
        },
      ]);
    });
  });

  describe('with one expression arg of length 0', () => {
    const arg0 = [
      { subject: 'https://example.org/#arg0me' },
    ];
    beforeAll(() => handler = new MutationExpressionCallbackHandler({ mutationType: 'INSERT', args: [{ pathExpression: arg0 }] }));

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
      ];

      expect(await handler.execute({}, { pathExpression })).toEqual([
        {
          mutationType: 'INSERT',
          domainExpression: [{ subject: 'https://example.org/#me' }],
          predicate: 'https://ex.org/p1',
          rangeExpression: [{ subject: 'https://example.org/#arg0me' }],
        },
      ]);
    });

    it('resolves a path of length 2', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
        { predicate: 'https://ex.org/p2' },
      ];

      expect(await handler.execute({}, { pathExpression })).toEqual([
        {
          mutationType: 'INSERT',
          domainExpression: [{ subject: 'https://example.org/#me' }, { predicate: 'https://ex.org/p1' }],
          predicate: 'https://ex.org/p2',
          rangeExpression: [{ subject: 'https://example.org/#arg0me' }],
        },
      ]);
    });
  });

  describe('with one expression arg of length 1', () => {
    const arg0 = [
      { subject: 'https://example.org/#arg0me' },
      { predicate: 'https://ex.org/arg0p1' },
    ];
    beforeAll(() => handler = new MutationExpressionCallbackHandler({ mutationType: 'INSERT', args: [{ pathExpression: arg0 }] }));

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
      ];

      expect(await handler.execute({}, { pathExpression })).toEqual([
        {
          mutationType: 'INSERT',
          domainExpression: [{ subject: 'https://example.org/#me' }],
          predicate: 'https://ex.org/p1',
          rangeExpression: [{ subject: 'https://example.org/#arg0me' }, { predicate: 'https://ex.org/arg0p1' }],
        },
      ]);
    });

    it('resolves a path of length 2', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
        { predicate: 'https://ex.org/p2' },
      ];

      expect(await handler.execute({}, { pathExpression })).toEqual([
        {
          mutationType: 'INSERT',
          domainExpression: [{ subject: 'https://example.org/#me' }, { predicate: 'https://ex.org/p1' }],
          predicate: 'https://ex.org/p2',
          rangeExpression: [{ subject: 'https://example.org/#arg0me' }, { predicate: 'https://ex.org/arg0p1' }],
        },
      ]);
    });
  });

  describe('with two expression args of length 2', () => {
    const arg0 = [
      { subject: 'https://example.org/#arg0me' },
      { predicate: 'https://ex.org/arg0p1' },
      { predicate: 'https://ex.org/arg0p2' },
    ];
    const arg1 = [
      { subject: 'https://example.org/#arg1me' },
      { predicate: 'https://ex.org/arg1p1' },
      { predicate: 'https://ex.org/arg1p2' },
    ];
    beforeAll(() => handler = new MutationExpressionCallbackHandler({
      mutationType: 'INSERT',
      args: [{ pathExpression: arg0 }, { pathExpression: arg1 }],
    }));

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
      ];

      expect(await handler.execute({}, { pathExpression })).toEqual([
        {
          mutationType: 'INSERT',
          domainExpression: [{ subject: 'https://example.org/#me' }],
          predicate: 'https://ex.org/p1',
          rangeExpression: [
            { subject: 'https://example.org/#arg0me' },
            { predicate: 'https://ex.org/arg0p1' },
            { predicate: 'https://ex.org/arg0p2' },
          ],
        },
        {
          mutationType: 'INSERT',
          domainExpression: [{ subject: 'https://example.org/#me' }],
          predicate: 'https://ex.org/p1',
          rangeExpression: [
            { subject: 'https://example.org/#arg1me' },
            { predicate: 'https://ex.org/arg1p1' },
            { predicate: 'https://ex.org/arg1p2' },
          ],
        },
      ]);
    });

    it('resolves a path of length 2', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
        { predicate: 'https://ex.org/p2' },
      ];

      expect(await handler.execute({}, { pathExpression })).toEqual([
        {
          mutationType: 'INSERT',
          domainExpression: [{ subject: 'https://example.org/#me' }, { predicate: 'https://ex.org/p1' }],
          predicate: 'https://ex.org/p2',
          rangeExpression: [
            { subject: 'https://example.org/#arg0me' },
            { predicate: 'https://ex.org/arg0p1' },
            { predicate: 'https://ex.org/arg0p2' },
          ],
        },
        {
          mutationType: 'INSERT',
          domainExpression: [{ subject: 'https://example.org/#me' }, { predicate: 'https://ex.org/p1' }],
          predicate: 'https://ex.org/p2',
          rangeExpression: [
            { subject: 'https://example.org/#arg1me' },
            { predicate: 'https://ex.org/arg1p1' },
            { predicate: 'https://ex.org/arg1p2' },
          ],
        },
      ]);
    });
  });
});
