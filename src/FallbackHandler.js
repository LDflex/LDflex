/**
 * Handler that delegates to a list of other handlers
 * and returns the first value that is not undefined.
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
