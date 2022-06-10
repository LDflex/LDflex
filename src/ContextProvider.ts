import { ContextParser, JsonLdContext, JsonLdContextNormalized } from 'jsonld-context-parser';

/**
 * Used to share context between multiple resolvers
 */
export default class ContextProvider {
  private _context: Promise<JsonLdContextNormalized | void> = Promise.resolve();

  /**
   * Creates a new resolver for the given context(s).
   */
  constructor(...contexts: JsonLdContext[]) {
    this.extendContext(...contexts);
  }

  /**
   * Extends the current context with the given context(s).
   */
  async extendContext(...contexts: JsonLdContext[]) {
    this._context = this._context.then(context => 
      new ContextParser().parse(context ? [context.getContextRaw(), ...contexts] : [...contexts])
    )
  }
}
