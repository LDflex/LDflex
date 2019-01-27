import MutationFunctionHandler from '../../src/MutationFunctionHandler';
import { namedNode, literal } from '@rdfjs/data-model';

const mutationType = 'TYPE';
const extendedPath = {};
const pathData = {
  extendPath: jest.fn(() => extendedPath),
  toString: () => 'path',
};

describe('a MutationFunctionHandler instance not allowing 0 args', () => {
  let handler;
  beforeAll(() => handler = new MutationFunctionHandler(mutationType, false));

  describe('resolving a property', async () => {
    let pathExpression;
    let result;
    beforeEach(() => {
      pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
      ];
      result = handler.execute(pathData, { pathExpression });
    });

    it('returns a function', async () => {
      expect(typeof await result).toEqual('function');
    });

    describe('with the function called with one raw argument', () => {
      let functionResult;
      beforeEach(async () => functionResult = await result('Ruben'));

      it('extends the path', () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        expect(args[0]).toBeInstanceOf(Object);
      });

      it('sets mutationExpressions to a promise to the expressions', async () => {
        const { mutationExpressions } = pathData.extendPath.mock.calls[0][0];
        expect(await mutationExpressions).toEqual([
          {
            mutationType,
            domainExpression: [{ subject: namedNode('https://example.org/#me') }],
            predicate: namedNode('https://ex.org/p1'),
            rangeExpression: [{ subject: literal('Ruben') }],
          },
        ]);
      });

      it('returns the extended path', () => {
        expect(functionResult).toEqual(extendedPath);
      });
    });

    describe('with the function called with one term argument', () => {
      let functionResult;
      beforeEach(async () => functionResult = await result(namedNode('http://example.org/')));

      it('extends the path', () => {
        expect(pathData.extendPath).toBeCalledTimes(1);
        const args = pathData.extendPath.mock.calls[0];
        expect(args).toHaveLength(1);
        expect(args[0]).toBeInstanceOf(Object);
      });

      it('sets mutationExpressions to a promise to the expressions', async () => {
        const { mutationExpressions } = pathData.extendPath.mock.calls[0][0];
        expect(await mutationExpressions).toEqual([
          {
            mutationType,
            domainExpression: [{ subject: namedNode('https://example.org/#me') }],
            predicate: namedNode('https://ex.org/p1'),
            rangeExpression: [{ subject: namedNode('http://example.org/') }],
          },
        ]);
      });

      it('returns the extended path', () => {
        expect(functionResult).toEqual(extendedPath);
      });
    });

    describe('with the function called without arguments', () => {
      it('errors when the function is invoked without arguments', async () => {
        expect(() => result())
          .toThrow(new Error('Mutation on path can not be invoked without arguments'));
      });
    });
  });

  describe('#createMutationExpressions', () => {
    describe('with one raw arg', () => {
      const args = ['other'];

      it('errors when no pathExpression is present', async () => {
        await expect(handler.createMutationExpressions(pathData, {}, args)).rejects
          .toThrow(new Error('path has no pathExpression property'));
      });

      it('errors with a pathExpression of length 0', async () => {
        const pathExpression = [
          { subject: namedNode('https://example.org/#me') },
        ];

        await expect(handler.createMutationExpressions(pathData, { pathExpression }, args)).rejects
          .toThrow(new Error('path should at least contain a subject and a predicate'));
      });

      it('errors when the pathExpression does not end with a predicate', async () => {
        const pathExpression = [
          { subject: namedNode('https://example.org/#me') },
          { nopredicate: namedNode('https://ex.org/p1') },
        ];

        await expect(handler.createMutationExpressions(pathData, { pathExpression }, args)).rejects
          .toThrow(new Error('Expected predicate in path'));
      });

      it('resolves a path of length 1', async () => {
        const pathExpression = [
          { subject: namedNode('https://example.org/#me') },
          { predicate: namedNode('https://ex.org/p1') },
        ];

        expect(await handler.createMutationExpressions(pathData, { pathExpression }, args)).toEqual([
          {
            mutationType,
            domainExpression: [{ subject: namedNode('https://example.org/#me') }],
            predicate: namedNode('https://ex.org/p1'),
            rangeExpression: [{ subject: literal('other') }],
          },
        ]);
      });

      it('resolves a path of length 2', async () => {
        const pathExpression = [
          { subject: namedNode('https://example.org/#me') },
          { predicate: namedNode('https://ex.org/p1') },
          { predicate: namedNode('https://ex.org/p2') },
        ];

        expect(await handler.createMutationExpressions(pathData, { pathExpression }, args)).toEqual([
          {
            mutationType,
            domainExpression: [
              { subject: namedNode('https://example.org/#me') },
              { predicate: namedNode('https://ex.org/p1') },
            ],
            predicate: namedNode('https://ex.org/p2'),
            rangeExpression: [{ subject: literal('other') }],
          },
        ]);
      });
    });

    describe('with one raw term arg', () => {
      const args = [namedNode('http://example.org/other')];

      it('errors when no pathExpression is present', async () => {
        await expect(handler.createMutationExpressions(pathData, {}, args)).rejects
          .toThrow(new Error('path has no pathExpression property'));
      });

      it('errors with a pathExpression of length 0', async () => {
        const pathExpression = [
          { subject: namedNode('https://example.org/#me') },
        ];

        await expect(handler.createMutationExpressions(pathData, { pathExpression }, args)).rejects
          .toThrow(new Error('path should at least contain a subject and a predicate'));
      });

      it('errors when the pathExpression does not end with a predicate', async () => {
        const pathExpression = [
          { subject: namedNode('https://example.org/#me') },
          { nopredicate: namedNode('https://ex.org/p1') },
        ];

        await expect(handler.createMutationExpressions(pathData, { pathExpression }, args)).rejects
          .toThrow(new Error('Expected predicate in path'));
      });

      it('resolves a path of length 1', async () => {
        const pathExpression = [
          { subject: namedNode('https://example.org/#me') },
          { predicate: namedNode('https://ex.org/p1') },
        ];

        expect(await handler.createMutationExpressions(pathData, { pathExpression }, args)).toEqual([
          {
            mutationType,
            domainExpression: [{ subject: namedNode('https://example.org/#me') }],
            predicate: namedNode('https://ex.org/p1'),
            rangeExpression: [{ subject: namedNode('http://example.org/other') }],
          },
        ]);
      });

      it('resolves a path of length 2', async () => {
        const pathExpression = [
          { subject: namedNode('https://example.org/#me') },
          { predicate: namedNode('https://ex.org/p1') },
          { predicate: namedNode('https://ex.org/p2') },
        ];

        expect(await handler.createMutationExpressions(pathData, { pathExpression }, args)).toEqual([
          {
            mutationType,
            domainExpression: [
              { subject: namedNode('https://example.org/#me') },
              { predicate: namedNode('https://ex.org/p1') },
            ],
            predicate: namedNode('https://ex.org/p2'),
            rangeExpression: [{ subject: namedNode('http://example.org/other') }],
          },
        ]);
      });
    });
  });

  describe('with two raw args', () => {
    const args = ['other1', 'other2'];

    it('errors when no pathExpression is present', async () => {
      await expect(handler.createMutationExpressions(pathData, {}, args)).rejects
        .toThrow(new Error('path has no pathExpression property'));
    });

    it('errors with a pathExpression of length 0', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
      ];

      await expect(handler.createMutationExpressions(pathData, { pathExpression }, args)).rejects
        .toThrow(new Error('path should at least contain a subject and a predicate'));
    });

    it('errors when the pathExpression does not end with a predicate', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { nopredicate: namedNode('https://ex.org/p1') },
      ];

      await expect(handler.createMutationExpressions(pathData, { pathExpression }, args)).rejects
        .toThrow(new Error('Expected predicate in path'));
    });

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
      ];

      expect(await handler.createMutationExpressions(pathData, { pathExpression }, args)).toEqual([
        {
          mutationType,
          domainExpression: [{ subject: namedNode('https://example.org/#me') }],
          predicate: namedNode('https://ex.org/p1'),
          rangeExpression: [{ subject: literal('other1') }],
        },
        {
          mutationType,
          domainExpression: [{ subject: namedNode('https://example.org/#me') }],
          predicate: namedNode('https://ex.org/p1'),
          rangeExpression: [{ subject: literal('other2') }],
        },
      ]);
    });

    it('resolves a path of length 2', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
        { predicate: namedNode('https://ex.org/p2') },
      ];

      expect(await handler.createMutationExpressions(pathData, { pathExpression }, args)).toEqual([
        {
          mutationType,
          domainExpression: [
            { subject: namedNode('https://example.org/#me') },
            { predicate: namedNode('https://ex.org/p1') },
          ],
          predicate: namedNode('https://ex.org/p2'),
          rangeExpression: [{ subject: literal('other1') }],
        },
        {
          mutationType,
          domainExpression: [
            { subject: namedNode('https://example.org/#me') },
            { predicate: namedNode('https://ex.org/p1') },
          ],
          predicate: namedNode('https://ex.org/p2'),
          rangeExpression: [{ subject: literal('other2') }],
        },
      ]);
    });
  });

  describe('with one expression arg of length 0', () => {
    const args = [
      {
        pathExpression: [
          { subject: namedNode('https://example.org/#arg0me') },
        ],
      },
    ];

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
      ];

      expect(await handler.createMutationExpressions(pathData, { pathExpression }, args)).toEqual([
        {
          mutationType,
          domainExpression: [{ subject: namedNode('https://example.org/#me') }],
          predicate: namedNode('https://ex.org/p1'),
          rangeExpression: [{ subject: namedNode('https://example.org/#arg0me') }],
        },
      ]);
    });

    it('resolves a path of length 2', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
        { predicate: namedNode('https://ex.org/p2') },
      ];

      expect(await handler.createMutationExpressions(pathData, { pathExpression }, args)).toEqual([
        {
          mutationType,
          domainExpression: [
            { subject: namedNode('https://example.org/#me') },
            { predicate: namedNode('https://ex.org/p1') },
          ],
          predicate: namedNode('https://ex.org/p2'),
          rangeExpression: [{ subject: namedNode('https://example.org/#arg0me') }],
        },
      ]);
    });
  });

  describe('with one expression arg of length 1', () => {
    const args = [
      {
        pathExpression: [
          { subject: namedNode('https://example.org/#arg0me') },
          { predicate: namedNode('https://ex.org/arg0p1') },
        ],
      },
    ];

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
      ];

      expect(await handler.createMutationExpressions(pathData, { pathExpression }, args)).toEqual([
        {
          mutationType,
          domainExpression: [{ subject: namedNode('https://example.org/#me') }],
          predicate: namedNode('https://ex.org/p1'),
          rangeExpression: [
            { subject: namedNode('https://example.org/#arg0me') },
            { predicate: namedNode('https://ex.org/arg0p1') },
          ],
        },
      ]);
    });

    it('resolves a path of length 2', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
        { predicate: namedNode('https://ex.org/p2') },
      ];

      expect(await handler.createMutationExpressions(pathData, { pathExpression }, args)).toEqual([
        {
          mutationType,
          domainExpression: [
            { subject: namedNode('https://example.org/#me') },
            { predicate: namedNode('https://ex.org/p1') },
          ],
          predicate: namedNode('https://ex.org/p2'),
          rangeExpression: [
            { subject: namedNode('https://example.org/#arg0me') },
            { predicate: namedNode('https://ex.org/arg0p1') },
          ],
        },
      ]);
    });
  });

  describe('with two expression args of length 2', () => {
    const args = [
      {
        pathExpression: [
          { subject: namedNode('https://example.org/#arg0me') },
          { predicate: namedNode('https://ex.org/arg0p1') },
          { predicate: namedNode('https://ex.org/arg0p2') },
        ],
      },
      {
        pathExpression: [
          { subject: namedNode('https://example.org/#arg1me') },
          { predicate: namedNode('https://ex.org/arg1p1') },
          { predicate: namedNode('https://ex.org/arg1p2') },
        ],
      },
    ];

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
      ];

      expect(await handler.createMutationExpressions(pathData, { pathExpression }, args)).toEqual([
        {
          mutationType,
          domainExpression: [{ subject: namedNode('https://example.org/#me') }],
          predicate: namedNode('https://ex.org/p1'),
          rangeExpression: [
            { subject: namedNode('https://example.org/#arg0me') },
            { predicate: namedNode('https://ex.org/arg0p1') },
            { predicate: namedNode('https://ex.org/arg0p2') },
          ],
        },
        {
          mutationType,
          domainExpression: [{ subject: namedNode('https://example.org/#me') }],
          predicate: namedNode('https://ex.org/p1'),
          rangeExpression: [
            { subject: namedNode('https://example.org/#arg1me') },
            { predicate: namedNode('https://ex.org/arg1p1') },
            { predicate: namedNode('https://ex.org/arg1p2') },
          ],
        },
      ]);
    });

    it('resolves a path of length 2', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
        { predicate: namedNode('https://ex.org/p2') },
      ];

      expect(await handler.createMutationExpressions(pathData, { pathExpression }, args)).toEqual([
        {
          mutationType,
          domainExpression: [
            { subject: namedNode('https://example.org/#me') },
            { predicate: namedNode('https://ex.org/p1') },
          ],
          predicate: namedNode('https://ex.org/p2'),
          rangeExpression: [
            { subject: namedNode('https://example.org/#arg0me') },
            { predicate: namedNode('https://ex.org/arg0p1') },
            { predicate: namedNode('https://ex.org/arg0p2') },
          ],
        },
        {
          mutationType,
          domainExpression: [
            { subject: namedNode('https://example.org/#me') },
            { predicate: namedNode('https://ex.org/p1') },
          ],
          predicate: namedNode('https://ex.org/p2'),
          rangeExpression: [
            { subject: namedNode('https://example.org/#arg1me') },
            { predicate: namedNode('https://ex.org/arg1p1') },
            { predicate: namedNode('https://ex.org/arg1p2') },
          ],
        },
      ]);
    });
  });
});

describe('a MutationFunctionHandler instance allowing 0 args', () => {
  let handler;
  beforeAll(() => handler = new MutationFunctionHandler(mutationType, true));

  describe('#createMutationExpressions', () => {
    describe('without args', () => {
      it('resolves a path of length 1', async () => {
        const pathExpression = [
          { subject: namedNode('https://example.org/#me') },
          { predicate: namedNode('https://ex.org/p1') },
        ];

        expect(await handler.createMutationExpressions(pathData, { pathExpression }, [])).toEqual([
          {
            mutationType,
            domainExpression: [
              { subject: namedNode('https://example.org/#me') },
              { predicate: namedNode('https://ex.org/p1') },
            ],
          },
        ]);
      });

      it('resolves a path of length 3', async () => {
        const pathExpression = [
          { subject: namedNode('https://example.org/#me') },
          { predicate: namedNode('https://ex.org/p1') },
          { predicate: namedNode('https://ex.org/p2') },
          { predicate: namedNode('https://ex.org/p3') },
        ];

        expect(await handler.createMutationExpressions(pathData, { pathExpression }, [])).toEqual([
          {
            mutationType,
            domainExpression: [
              { subject: namedNode('https://example.org/#me') },
              { predicate: namedNode('https://ex.org/p1') },
              { predicate: namedNode('https://ex.org/p2') },
              { predicate: namedNode('https://ex.org/p3') },
            ],
          },
        ]);
      });
    });
  });
});
