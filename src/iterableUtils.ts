import { ResultStream } from '@rdfjs/types';

/**
 * Returns the elements of the iterable as an array
 */
export async function iterableToArray<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of iterable)
    items.push(item);
  return items;
}

/**
 * Gets the first element of the iterable.
 */
export async function getFirstItem<T>(iterable: AsyncIterable<T>): Promise<T> {
  for await (const item of iterable)
    return item;
  throw new Error('Expected iterable to contain at least one element');
}

/**
 * Creates an async iterator with the item as only element.
 */
export async function *iteratorFor<T>(item: T): AsyncIterator<T> {
  return item
}

/**
 * Transforms the readable into an asynchronously iterable object
 * From: https://github.com/LDflex/LDflex-Comunica/blob/cf3b74013fda96063b5edbffd14fa7214ad119a0/src/ComunicaEngine.ts#L161
 */
export async function *streamToAsyncIterable<T>(readable: ResultStream<T>): AsyncIterableIterator<T> {
  let item: T | null;
  let error: Error | undefined;
  let done = false;
  let cb = () => {};

  function settlePromise() {
    cb();
  }

  function finish(error?: Error) {
    done = true;
    error = error;
  }

  readable.on('readable', settlePromise);
  readable.on('error', finish);
  readable.on('end', finish);

  while (!done) {
    while ((item = readable.read()) !== null)
      yield item;
    await new Promise<void>(res => { cb = res });
  }

  readable.removeListener('readable', settlePromise);
  readable.removeListener('error', finish);
  readable.removeListener('end', finish);

  if (error)
    throw error;
}
