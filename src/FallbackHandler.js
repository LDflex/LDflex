/**
 * Converts a handler that returns an asynchronous iterator into a single-value handler.
 */
export default class FallbackHandler {
  constructor(handlers = []) {
    this._handlers = handlers;
  }

  execute(path, proxy) {
    for (const handler of this._handlers) {
      const value = handler.execute(path, proxy);
      if (typeof value !== 'undefined')
        return value;
    }
    return undefined;
  }
}
