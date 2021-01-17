import { ContextParser } from 'jsonld-context-parser';

/**
 * Used to share context between multiple resolvers
 */
export default class ContextProvider {
  _context = Promise.resolve({});

  /**
   * Creates a new resolver for the given context(s).
   */
  constructor(...contexts) {
    this.extendContext(...contexts);
  }

  /**
   * Extends the current context with the given context(s).
   */
  async extendContext(...contexts) {
    await (this._context = this._context.then(({ contextRaw }) =>
      new ContextParser().parse([contextRaw, ...contexts])));
  }
}
