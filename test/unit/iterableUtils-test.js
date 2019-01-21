import {
  getIterator,
  iterableToThen,
  iterablePromise,
  memoizeIterable,
  conditionalHandler,
} from '../../src/iterableUtils';

describe('getIterator', () => {
  it('returns undefined if the handler returns falsy', () => {
    const handler = { execute: () => false };
    expect(getIterator(handler).execute()).toBeUndefined();
  });
});

describe('iterableToThen', () => {
  it('returns undefined if the handler returns falsy', () => {
    const handler = { execute: () => false };
    expect(iterableToThen(handler).execute()).toBeUndefined();
  });
});

describe('iterablePromise', () => {
  it('returns an object that is iterable', async () => {
    const iterable = iterablePromise(iteratorOf(1, 2, 3));
    expect(await toArray(iterable)).toEqual([1, 2, 3]);
  });

  it('returns an object with a then function that resolves', async () => {
    const promise = iterablePromise(() => iteratorOf(1, 2, 3));
    await expect(promise).resolves.toBe(1);
  });

  it('returns an object with a then function that rejects', async () => {
    const promise = iterablePromise(() => iteratorOf(0));
    await expect(promise).rejects.toEqual(new Error('iterator error'));
  });

  it('returns an object with a catch function', async () => {
    const promise = iterablePromise(() => iteratorOf(0));
    const result = promise.catch(error => {
      expect(error).toEqual(new Error('iterator error'));
      return 'caught';
    });
    await expect(result).resolves.toBe('caught');
  });

  it('returns an object with a finally function', done => {
    const promise = iterablePromise(() => iteratorOf());
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

describe('conditionalHandler', () => {
  it('returns undefined if the condition returns false', async () => {
    const handler = { execute: () => 'abc' };
    expect(conditionalHandler(handler, () => false).execute()).toBeUndefined();
  });

  it('returns the inner handlers response if the condition returns true', async () => {
    const handler = { execute: () => 'abc' };
    expect(conditionalHandler(handler, () => true).execute()).toEqual('abc');
  });

  it('calls the callback with path and proxy', async () => {
    const handler = { execute: () => 'abc' };
    const cb = jest.fn(() => true);
    expect(conditionalHandler(handler, cb).execute('path', 'proxy')).toEqual('abc');
    expect(cb).toHaveBeenCalledWith('path', 'proxy');
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
