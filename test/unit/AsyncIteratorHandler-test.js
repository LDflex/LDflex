import AsyncIteratorHandler from '../../src/AsyncIteratorHandler';
import { iterableToArray } from '../../src/iterableUtils';

describe('a AsyncIteratorHandler instance', () => {
  let handler;
  beforeAll(() => {
    handler = new AsyncIteratorHandler();
  });

  describe('on a path with a subject', () => {
    const subject = 'https://example.org/#Alice';
    const pathData = { subject };
    const path = { subject };

    const iterable = {};
    beforeAll(() => {
      iterable[Symbol.asyncIterator] = handler.handle(pathData, path);
    });

    it('returns an iterator for the subject', async () => {
      expect(await iterableToArray(iterable)).toEqual([subject]);
    });
  });

  describe('on a path with results', () => {
    const results = [
      { subject: 'https://example.org/#Alice' },
      { subject: 'https://example.org/#Bob' },
    ];
    const pathData = {};
    const path = {
      results: (async function *getResults() {
        yield* results;
      }()),
    };

    const iterable = {};
    beforeAll(() => {
      iterable[Symbol.asyncIterator] = handler.handle(pathData, path);
    });

    it('returns an iterator for the results', async () => {
      expect(await iterableToArray(iterable)).toEqual(results);
    });
  });
});
