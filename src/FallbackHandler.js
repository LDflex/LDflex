/**
 * Returns the result of the first handler that does not return undefined.
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
