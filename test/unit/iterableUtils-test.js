import {
  getIterator,
  iterableToThen,
  iterablePromise,
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
    const object = iterablePromise(iteratorOf(1, 2, 3));
    const items = [];
    for await (const item of object)
      items.push(item);
    expect(items).toEqual([1, 2, 3]);
  });

  it('returns an object with a then function that resolves', async () => {
    const object = iterablePromise(() => iteratorOf(1, 2, 3));
    await expect(object).resolves.toBe(1);
  });

  it('returns an object with a then function that rejects', async () => {
    const object = iterablePromise(() => iteratorOf(0));
    await expect(object).rejects.toEqual(new Error('iterator error'));
  });

  it('returns an object with a catch function', async () => {
    const object = iterablePromise(() => iteratorOf(0));
    const result = object.catch(error => {
      expect(error).toEqual(new Error('iterator error'));
      return 'caught';
    });
    await expect(result).resolves.toBe('caught');
  });

  it('returns an object with a finally function', done => {
    const object = iterablePromise(() => iteratorOf(0));
    object.finally(done);
  });
});

async function* iteratorOf(...items) {
  for (const item of items) {
    if (item === 0)
      throw new Error('iterator error');
    yield item;
  }
}
