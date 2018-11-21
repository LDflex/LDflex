/**
 * Converts a handler that yields an asynchronous iterator
 * into a single-value promise handler.
 */
export default function toSingularHandler(handler) {
  return {
    execute(path, proxy) {
      // It the value does not lead to an asynchronous iterator, return as-is
      const value = handler.execute(path, proxy);
      if (typeof value !== 'function')
        return value;

      // Return a then function to the first item's value
      const iterator = value();
      return (resolve, reject) =>
        iterator.next().then(item => resolve(item.value), reject);
    },
  };
}
