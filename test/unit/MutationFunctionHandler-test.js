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

  describe('resolving a property', () => {
    let pathExpression;
    let result;
    beforeEach(() => {
      pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
      ];
      result = handler.handle(pathData, { pathExpression });
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
            conditions: [{ subject: namedNode('https://example.org/#me') }],
            predicateObjects: [{
              predicate: namedNode('https://ex.org/p1'),
              objects: [literal('Ruben')],
            }],
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
            conditions: [{ subject: namedNode('https://example.org/#me') }],
            predicateObjects: [{
              predicate: namedNode('https://ex.org/p1'),
              objects: [namedNode('http://example.org/')],
            }],
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
            conditions: [{ subject: namedNode('https://example.org/#me') }],
            predicateObjects: [{
              predicate: namedNode('https://ex.org/p1'),
              objects: [literal('other')],
            }],
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
            conditions: [
              { subject: namedNode('https://example.org/#me') },
              { predicate: namedNode('https://ex.org/p1') },
            ],
            predicateObjects: [{
              predicate: namedNode('https://ex.org/p2'),
              objects: [literal('other')],
            }],
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
            conditions: [{ subject: namedNode('https://example.org/#me') }],
            predicateObjects: [{
              predicate: namedNode('https://ex.org/p1'),
              objects: [namedNode('http://example.org/other')],
            }],
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
            conditions: [
              { subject: namedNode('https://example.org/#me') },
              { predicate: namedNode('https://ex.org/p1') },
            ],
            predicateObjects: [{
              predicate: namedNode('https://ex.org/p2'),
              objects: [namedNode('http://example.org/other')],
            }],
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
          conditions: [{ subject: namedNode('https://example.org/#me') }],
          predicateObjects: [{
            predicate: namedNode('https://ex.org/p1'),
            objects: [literal('other1'), literal('other2')],
          }],
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
          conditions: [
            { subject: namedNode('https://example.org/#me') },
            { predicate: namedNode('https://ex.org/p1') },
          ],
          predicateObjects: [{
            predicate: namedNode('https://ex.org/p2'),
            objects: [literal('other1'), literal('other2')],
          }],
        },
      ]);
    });
  });

  describe('with an empty async iterable arg', () => {
    const args = [
      (async function* () { /* empty */ }()),
    ];

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
      ];

      expect(await handler.createMutationExpressions(pathData, { pathExpression }, args))
        .toEqual([{ predicateObjects: [] }]);
    });
  });

  describe('with an async iterable arg', () => {
    const args = [
      (async function* () {
        yield 'other1';
        yield 'other2';
      }()),
    ];

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
      ];

      expect(await handler.createMutationExpressions(pathData, { pathExpression }, args)).toEqual([
        {
          mutationType,
          conditions: [{ subject: namedNode('https://example.org/#me') }],
          predicateObjects: [{
            predicate: namedNode('https://ex.org/p1'),
            objects: [literal('other1'), literal('other2')],
          }],
        },
      ]);
    });
  });

  describe('with an invalid arg', () => {
    const args = [null];

    it('does not resolve a path of length 1', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
      ];

      await expect(handler.createMutationExpressions(pathData, { pathExpression }, args))
        .rejects.toThrow('Invalid object: null');
    });
  });

  describe('with multiple args of different kinds', () => {
    const args = [
      'other1',
      Promise.resolve('other2'),
      (async function* () {
        yield 'other3';
        yield 'other4';
      }()),
      (async function* () {
        yield 'other5';
        yield 'other6';
      }()),
    ];

    it('resolves a path of length 1', async () => {
      const pathExpression = [
        { subject: namedNode('https://example.org/#me') },
        { predicate: namedNode('https://ex.org/p1') },
      ];

      expect(await handler.createMutationExpressions(pathData, { pathExpression }, args)).toEqual([
        {
          mutationType,
          conditions: [{ subject: namedNode('https://example.org/#me') }],
          predicateObjects: [{
            predicate: namedNode('https://ex.org/p1'),
            objects: [
              literal('other1'), literal('other2'), literal('other3'),
              literal('other4'), literal('other5'), literal('other6'),
            ],
          }],
        },
      ]);
    });
  });

  describe('with an object map arg', () => {
    const pathExpression = [
      { subject: namedNode('https://example.org/#me') },
    ];

    it('resolves a path of length 1', async () => {
      const args = [{ 'http://a': 'b', 'http://c': 'd' }];
      const path = { pathExpression };
      path['http://a'] = { pathExpression: pathExpression.concat([{ predicate: namedNode('http://a') }]) };
      path['http://c'] = { pathExpression: pathExpression.concat([{ predicate: namedNode('http://c') }]) };

      expect(await handler.createMutationExpressions(pathData, path, args)).toEqual([
        {
          mutationType,
          conditions: [{ subject: namedNode('https://example.org/#me') }],
          predicateObjects: [
            { predicate: namedNode('http://a'), objects: [literal('b')] },
            { predicate: namedNode('http://c'), objects: [literal('d')] },
          ],
        },
      ]);
    });

    it('interprets no value as an empty argument list', async () => {
      const args0 = [{ 'http://a': null }];
      const args1 = [{ 'http://a': [] }];
      const path = { pathExpression };
      path['http://a'] = { pathExpression: pathExpression.concat([{ predicate: namedNode('http://a') }]) };

      expect(await handler.createMutationExpressions(pathData, path, args0))
        .toEqual(await handler.createMutationExpressions(pathData, path, args1));
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
            conditions: [
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
            conditions: [
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
