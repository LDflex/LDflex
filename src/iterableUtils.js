const done = {};

/**
 * Returns the elements of the iterable as an array
 */
export async function iterableToArray(iterable) {
  const items = [];
  for await (const item of iterable)
    items.push(item);
  return items;
}

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
