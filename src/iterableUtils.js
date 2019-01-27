const done = {};

/**
 * Gets the first element of the iterable.
 */
export function getFirstItem(iterable) {
  const iterator = iterable[Symbol.asyncIterator]();
  return iterator.next().then(item => item.value);
}

/**
 * Creates an async iterator with the item as only element.
 */
export function iteratorFor(item) {
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
