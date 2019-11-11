import AsyncIteratorHandler from '../../src/AsyncIteratorHandler';

describe('a AsyncIteratorHandler instance', () => {
  let handler;
  beforeAll(() => handler = new AsyncIteratorHandler());

  describe('on a path with a subject', () => {
    const subject = 'https://example.org/#Alice';
    const pathData = { subject };
    const path = { subject };

    const items = [];
    beforeAll(async () => {
      const iterable = {
        [Symbol.asyncIterator]: handler.handle(pathData, path),
      };
      for await (const item of iterable)
        items.push(item);
    });

    it('returns an iterator for the subject', () => {
      expect(items).toEqual([subject]);
    });
  });

  describe('on a path with results', () => {
    const results = [
      'https://example.org/#Alice',
      'https://example.org/#Bob',
    ];
    const pathData = {};
    const path = {
      results: (async function *getResults() {
        for (const subject of results)
          yield { subject };
      }()),
    };

    const items = [];
    beforeAll(async () => {
      const iterable = {
        [Symbol.asyncIterator]: handler.handle(pathData, path),
      };
      for await (const item of iterable)
        items.push(item.subject);
    });

    it('returns an iterator for the results', () => {
      expect(items).toEqual(results);
    });
  });
});
