/**
 * Gets the iterator function
 * from an iterable returned by a handler.
 */
export const getIterator = mapHandler(iterable =>
  () => iterable[Symbol.asyncIterator]());

/**
 * Creates a then function to the first element
 * of an iterable returned by a handler.
 */
export const iterableToThen = mapHandler(createThen);

/**
 * Creates an async iterable
 * from a promise returned by a handler.
 */
export const promiseToIterable = mapHandler(createIterable);

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
 * Creates a handler that maps the result of another handler.
 */
function mapHandler(mapper) {
  return handler => ({
    execute(path, proxy) {
      const result = handler.execute(path, proxy);
      return result ? mapper(result) : undefined;
    },
  });
}

/**
 * Creates a handler that will only execute if a condition is met.
 * The condition parameter is a callback that takes path and proxy arguments, and must return a boolean.
 */
export function conditionalHandler(handler, condition) {
  return {
    execute(path, proxy) {
      return condition(path, proxy) ? handler.execute(path, proxy) : undefined;
    },
  };
}

/**
 * Creates a then function to the first element of the iterable.
 */
function createThen(iterable) {
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
          next = Promise.resolve({ done: true });
          return current;
        },
      };
    },
  };
}
