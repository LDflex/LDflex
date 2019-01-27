const done = {};

/**
 * Returns an iterable that is also a promise to the first element.
 */
export function iterablePromise(iterable) {
  // If called with a generator function,
  // memoize it to enable multiple iterations
  if (typeof iterable === 'function')
    iterable = memoizeIterable(iterable());

  // Return an object that is iterable and a promise
  return {
    [Symbol.asyncIterator]() {
      return iterable[Symbol.asyncIterator]();
    },
    get then() {
      return createThen(this);
    },
    catch(onRejected) {
      return this.then(null, onRejected);
    },
    finally(callback) {
      return this.then().finally(callback);
    },
  };
}

/**
 * Returns a memoized version of the iterable
 * that can be iterated over as many times as needed.
 */
export function memoizeIterable(iterable) {
  const cache = [];
  let iterator = iterable[Symbol.asyncIterator]();

  return {
    [Symbol.asyncIterator]() {
      let i = 0;
      return {
        async next() {
          // Return the item if it has been read already
          if (i < cache.length)
            return cache[i++];

          // Stop if there are no more items
          if (!iterator)
            return { done: true };

          // Read and cache an item from the iterable otherwise
          const item = cache[i++] = iterator.next();
          if ((await item).done)
            iterator = null;
          return item;
        },
      };
    },
  };
}

/**
 * Creates a then function to the first element of the iterable.
 */
export function createThen(iterable) {
  const iterator = iterable[Symbol.asyncIterator]();
  return (onResolved, onRejected) => iterator.next()
    .then(item => item.value)
    .then(onResolved, onRejected);
}

/**
 * Creates an async iterator with the items as only element.
 */
export function createIterator(item) {
  return {
    async next() {
      if (item !== done) {
        const value = await item;
        item = done;
        return { value };
      }
      return { done: true };
    },
  };
}
