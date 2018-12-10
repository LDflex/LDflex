/**
 * Gets the iterator function
 * from an iterable returned by a handler.
 */
export function getIterator(handler) {
  return {
    execute(path, proxy) {
      const iterable = handler.execute(path, proxy);
      return !iterable ? undefined : () => iterable[Symbol.asyncIterator]();
    },
  };
}

/**
 * Creates a then function to the first element
 * of an iterable returned by a handler.
 */
export function iterableToThen(handler) {
  return {
    execute(path, proxy) {
      const iterable = handler.execute(path, proxy);
      return !iterable ? undefined : createThenToFirstItem(iterable);
    },
  };
}

/**
 * Creates an async iterable from a promise returned by a handler.
 */
export function promiseToIterable(handler) {
  return {
    execute(path, proxy) {
      const promise = handler.execute(path, proxy);
      return !promise ? undefined : createIterable(promise);
    },
  };
}

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
      return createThenToFirstItem(this);
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
  let iterator = iterable[Symbol.asyncIterator]();
  const cache = [];

  // Creates a new iterator with the same items as the iterable
  function newIterator() {
    let i = 0;
    async function next() {
      // Return the item if it has been read already
      if (i < cache.length)
        return cache[i++];

      // Stop if there are no more items
      if (!iterator)
        return Promise.resolve({ done: true });

      // Read and cache an item from the iterable otherwise
      const item = cache[i++] = iterator.next();
      if ((await item).done)
        iterator = null;
      return item;
    }
    return { next };
  }

  return { [Symbol.asyncIterator]: newIterator };
}

/**
 * Creates a then function to the first element of the iterable.
 */
function createThenToFirstItem(iterable) {
  const iterator = iterable[Symbol.asyncIterator]();
  return (onResolved, onRejected) => iterator.next()
    .then(item => item.value)
    .then(onResolved, onRejected);
}

/**
 * Creates an async iterable with the promise as only element.
 */
function createIterable(promise) {
  return {
    [Symbol.asyncIterator]() {
      let next = promise.then(value => ({ value }));
      return {
        next() {
          const current = next;
          next = { done: true };
          return current;
        },
      };
    },
  };
}
