import {
  toIterablePromise,
  memoizeIterable,
} from '../../src/promiseUtils';

describe('toIterablePromise', () => {
  it('returns an object that is iterable', async () => {
    const iterable = toIterablePromise(iteratorOf(1, 2, 3));
    expect(await toArray(iterable)).toEqual([1, 2, 3]);
  });

  it('returns an object with a then function that resolves', async () => {
    const promise = toIterablePromise(() => iteratorOf(1, 2, 3));
    await expect(promise).resolves.toBe(1);
  });

  it('returns an object with a then function that rejects', async () => {
    const promise = toIterablePromise(() => iteratorOf(0));
    await expect(promise).rejects.toEqual(new Error('iterator error'));
  });

  it('returns an object with a catch function', async () => {
    const promise = toIterablePromise(() => iteratorOf(0));
    const result = promise.catch(error => {
      expect(error).toEqual(new Error('iterator error'));
      return 'caught';
    });
    await expect(result).resolves.toBe('caught');
  });

  it('returns an object with a finally function', done => {
    const promise = toIterablePromise(() => iteratorOf());
    promise.finally(done);
  });
});

describe('memoizeIterable', () => {
  it('can memoize the empty iterable', async () => {
    const iterable = memoizeIterable(iteratorOf());
    expect(await toArray(iterable)).toEqual([]);
    expect(await toArray(iterable)).toEqual([]);
  });

  it('can memoize an iterable of length 3', async () => {
    const iterable = memoizeIterable(iteratorOf(1, 2, 3));
    expect(await toArray(iterable)).toEqual([1, 2, 3]);
    expect(await toArray(iterable)).toEqual([1, 2, 3]);
  });

  it('ignores next calls past the end', async () => {
    const iterable = memoizeIterable(iteratorOf());
    const iterator = iterable[Symbol.asyncIterator]();
    expect(await iterator.next()).toHaveProperty('done', true);
    expect(await iterator.next()).toHaveProperty('done', true);
    expect(await iterator.next()).toHaveProperty('done', true);
  });
});

async function* iteratorOf(...items) {
  for (const item of items) {
    if (item === 0)
      throw new Error('iterator error');
    yield item;
  }
}

async function toArray(iterable) {
  const items = [];
  for await (const item of iterable)
    items.push(item);
  return items;
}
