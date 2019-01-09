import MutationFunctionHandler from '../../src/MutationFunctionHandler';

describe('a MutationFunctionHandler instance', () => {
  const mutationType = 'TYPE';
  const extendedPath = {};
  const path = { extend: jest.fn(() => extendedPath), toString: () => 'path' };
  let handler;
  beforeAll(() => handler = new MutationFunctionHandler(mutationType));

  describe('resolving a property', async () => {
    const pathExpression = [
      { subject: 'https://example.org/#me' },
      { predicate: 'https://ex.org/p1' },
    ];
    let result;
    beforeEach(() => result = handler.execute(path, { pathExpression }));

    it('returns a function', async () => {
      expect(typeof await result).toEqual('function');
    });

    describe('with the function called with one argument', () => {
      let functionResult;
      beforeEach(async () => functionResult = await result('Ruben'));

      it('extends the path', () => {
        expect(path.extend).toBeCalledTimes(1);
        const args = path.extend.mock.calls[0];
        expect(args).toHaveLength(1);
        expect(args[0]).toBeInstanceOf(Object);
      });

      it('sets mutationExpressions to a promise to the expressions', async () => {
        const { mutationExpressions } = path.extend.mock.calls[0][0];
        expect(await mutationExpressions).toEqual([
          {
            mutationType,
            domainExpression: [{ subject: 'https://example.org/#me' }],
            predicate: 'https://ex.org/p1',
            rangeExpression: [{ subject: '"Ruben"' }],
          },
        ]);
      });

      it('returns the extended path', () => {
        expect(functionResult).toEqual(extendedPath);
      });
    });
  });

  describe('#createMutationExpressions', () => {
    describe('without args', () => {
      it('errors when the function is invoked without arguments', async () => {
        await expect(handler.createMutationExpressions(path, {}, [])).rejects
          .toThrow(new Error('Mutation on path can not be invoked without arguments'));
      });
    });

    describe('with one raw arg', () => {
      const args = ['other'];

      it('errors when no pathExpression is present', async () => {
        await expect(handler.createMutationExpressions(path, {}, args)).rejects
          .toThrow(new Error('path has no pathExpression property'));
      });

      it('errors with a pathExpression of length 0', async () => {
        const pathExpression = [
          { subject: 'https://example.org/#me' },
        ];

        await expect(handler.createMutationExpressions(path, { pathExpression }, args)).rejects
          .toThrow(new Error('path should at least contain a subject and a predicate'));
      });

      it('errors when the pathExpression does not end with a predicate', async () => {
        const pathExpression = [
          { subject: 'https://example.org/#me' },
          { nopredicate: 'https://ex.org/p1' },
        ];

        await expect(handler.createMutationExpressions(path, { pathExpression }, args)).rejects
          .toThrow(new Error('Expected predicate in path'));
      });

      it('resolves a path of length 1', async () => {
        const pathExpression = [
          { subject: 'https://example.org/#me' },
          { predicate: 'https://ex.org/p1' },
        ];

        expect(await handler.createMutationExpressions(path, { pathExpression }, args)).toEqual([
          {
            mutationType,
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

        expect(await handler.createMutationExpressions(path, { pathExpression }, args)).toEqual([
          {
            mutationType,
            domainExpression: [{ subject: 'https://example.org/#me' }, { predicate: 'https://ex.org/p1' }],
            predicate: 'https://ex.org/p2',
            rangeExpression: [{ subject: '"other"' }],
          },
        ]);
      });
    });
  });

  describe('with two raw args', () => {
    const args = ['other1', 'other2'];

    it('errors when no pathExpression is present', async () => {
      await expect(handler.createMutationExpressions(path, {}, args)).rejects
        .toThrow(new Error('path has no pathExpression property'));
    });

    it('errors with a pathExpression of length 0', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
      ];

      await expect(handler.createMutationExpressions(path, { pathExpression }, args)).rejects
        .toThrow(new Error('path should at least contain a subject and a predicate'));
    });

    it('errors when the pathExpression does not end with a predicate', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { nopredicate: 'https://ex.org/p1' },
      ];

      await expect(handler.createMutationExpressions(path, { pathExpression }, args)).rejects
        .toThrow(new Error('Expected predicate in path'));
    });

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
      ];

      expect(await handler.createMutationExpressions(path, { pathExpression }, args)).toEqual([
        {
          mutationType,
          domainExpression: [{ subject: 'https://example.org/#me' }],
          predicate: 'https://ex.org/p1',
          rangeExpression: [{ subject: '"other1"' }],
        },
        {
          mutationType,
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

      expect(await handler.createMutationExpressions(path, { pathExpression }, args)).toEqual([
        {
          mutationType,
          domainExpression: [{ subject: 'https://example.org/#me' }, { predicate: 'https://ex.org/p1' }],
          predicate: 'https://ex.org/p2',
          rangeExpression: [{ subject: '"other1"' }],
        },
        {
          mutationType,
          domainExpression: [{ subject: 'https://example.org/#me' }, { predicate: 'https://ex.org/p1' }],
          predicate: 'https://ex.org/p2',
          rangeExpression: [{ subject: '"other2"' }],
        },
      ]);
    });
  });

  describe('with one expression arg of length 0', () => {
    const args = [
      {
        pathExpression: [
          { subject: 'https://example.org/#arg0me' },
        ],
      },
    ];

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
      ];

      expect(await handler.createMutationExpressions(path, { pathExpression }, args)).toEqual([
        {
          mutationType,
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

      expect(await handler.createMutationExpressions(path, { pathExpression }, args)).toEqual([
        {
          mutationType,
          domainExpression: [{ subject: 'https://example.org/#me' }, { predicate: 'https://ex.org/p1' }],
          predicate: 'https://ex.org/p2',
          rangeExpression: [{ subject: 'https://example.org/#arg0me' }],
        },
      ]);
    });
  });

  describe('with one expression arg of length 1', () => {
    const args = [
      {
        pathExpression: [
          { subject: 'https://example.org/#arg0me' },
          { predicate: 'https://ex.org/arg0p1' },
        ],
      },
    ];

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
      ];

      expect(await handler.createMutationExpressions(path, { pathExpression }, args)).toEqual([
        {
          mutationType,
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

      expect(await handler.createMutationExpressions(path, { pathExpression }, args)).toEqual([
        {
          mutationType,
          domainExpression: [{ subject: 'https://example.org/#me' }, { predicate: 'https://ex.org/p1' }],
          predicate: 'https://ex.org/p2',
          rangeExpression: [{ subject: 'https://example.org/#arg0me' }, { predicate: 'https://ex.org/arg0p1' }],
        },
      ]);
    });
  });

  describe('with two expression args of length 2', () => {
    const args = [
      {
        pathExpression: [
          { subject: 'https://example.org/#arg0me' },
          { predicate: 'https://ex.org/arg0p1' },
          { predicate: 'https://ex.org/arg0p2' },
        ],
      },
      {
        pathExpression: [
          { subject: 'https://example.org/#arg1me' },
          { predicate: 'https://ex.org/arg1p1' },
          { predicate: 'https://ex.org/arg1p2' },
        ],
      },
    ];

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: 'https://example.org/#me' },
        { predicate: 'https://ex.org/p1' },
      ];

      expect(await handler.createMutationExpressions(path, { pathExpression }, args)).toEqual([
        {
          mutationType,
          domainExpression: [{ subject: 'https://example.org/#me' }],
          predicate: 'https://ex.org/p1',
          rangeExpression: [
            { subject: 'https://example.org/#arg0me' },
            { predicate: 'https://ex.org/arg0p1' },
            { predicate: 'https://ex.org/arg0p2' },
          ],
        },
        {
          mutationType,
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

      expect(await handler.createMutationExpressions(path, { pathExpression }, args)).toEqual([
        {
          mutationType,
          domainExpression: [{ subject: 'https://example.org/#me' }, { predicate: 'https://ex.org/p1' }],
          predicate: 'https://ex.org/p2',
          rangeExpression: [
            { subject: 'https://example.org/#arg0me' },
            { predicate: 'https://ex.org/arg0p1' },
            { predicate: 'https://ex.org/arg0p2' },
          ],
        },
        {
          mutationType,
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
