import ToArrayHandler from '../../src/ToArrayHandler';

describe('a ToArrayHandler instance', () => {
  let handler;
  beforeAll(() => handler = new ToArrayHandler());

  describe('when calling the returned function without arguments', () => {
    it('returns the empty array if the path is null', async () => {
      const path = null;
      const toArray = handler.handle(null, path);
      await expect(toArray()).resolves.toEqual([]);
    });

    it('returns the empty array if the path is not an async iterator', async () => {
      const path = {};
      const toArray = handler.handle(null, path);
      await expect(toArray()).resolves.toEqual([]);
    });

    it('returns the empty array if the path is an empty async iterator', async () => {
      const path = asyncIteratorOf([]);
      const toArray = handler.handle(null, path);
      await expect(toArray()).resolves.toEqual([]);
    });

    it('extracts items from an async iterator of size 1', async () => {
      const path = asyncIteratorOf(['a']);
      const toArray = handler.handle(null, path);
      await expect(toArray()).resolves.toEqual(['a']);
    });

    it('extracts items from an async iterator of size 3', async () => {
      const path = asyncIteratorOf(['a', Promise.resolve('b'), 'c']);
      const toArray = handler.handle(null, path);
      await expect(toArray()).resolves.toEqual(['a', 'b', 'c']);
    });
  });

  describe('when calling the returned function with a synchronous mapper', () => {
    function map(item, index) {
      return `${item}-${index}`;
    }

    it('returns the empty array if the path is null', async () => {
      const path = null;
      const toArray = handler.handle(null, path);
      await expect(toArray(map)).resolves.toEqual([]);
    });

    it('returns the empty array if the path is not an async iterator', async () => {
      const path = {};
      const toArray = handler.handle(null, path);
      await expect(toArray(map)).resolves.toEqual([]);
    });

    it('returns the empty array if the path is an empty async iterator', async () => {
      const path = asyncIteratorOf([]);
      const toArray = handler.handle(null, path);
      await expect(toArray(map)).resolves.toEqual([]);
    });

    it('extracts items from an async iterator of size 1', async () => {
      const path = asyncIteratorOf(['a']);
      const toArray = handler.handle(null, path);
      await expect(toArray(map)).resolves.toEqual(['a-0']);
    });

    it('extracts items from an async iterator of size 3', async () => {
      const path = asyncIteratorOf(['a', Promise.resolve('b'), 'c']);
      const toArray = handler.handle(null, path);
      await expect(toArray(map)).resolves.toEqual(['a-0', 'b-1', 'c-2']);
    });
  });

  describe('when calling the returned function with an asynchronous mapper', () => {
    async function map(item, index) {
      return `${item}-${index}`;
    }

    it('returns the empty array if the path is null', async () => {
      const path = null;
      const toArray = handler.handle(null, path);
      await expect(toArray(map)).resolves.toEqual([]);
    });

    it('returns the empty array if the path is not an async iterator', async () => {
      const path = {};
      const toArray = handler.handle(null, path);
      await expect(toArray(map)).resolves.toEqual([]);
    });

    it('returns the empty array if the path is an empty async iterator', async () => {
      const path = asyncIteratorOf([]);
      const toArray = handler.handle(null, path);
      await expect(toArray(map)).resolves.toEqual([]);
    });

    it('extracts items from an async iterator of size 1', async () => {
      const path = asyncIteratorOf(['a']);
      const toArray = handler.handle(null, path);
      await expect(toArray(map)).resolves.toEqual(['a-0']);
    });

    it('extracts items from an async iterator of size 3', async () => {
      const path = asyncIteratorOf(['a', Promise.resolve('b'), 'c']);
      const toArray = handler.handle(null, path);
      await expect(toArray(map)).resolves.toEqual(['a-0', 'b-1', 'c-2']);
    });
  });
});

async function* asyncIteratorOf(items) {
  for (const item of items)
    yield item;
}
