import { ContextParser, IExpandOptions, IJsonLdContextNormalizedRaw, JsonLdContext, JsonLdContextNormalized } from 'jsonld-context-parser';

/**
 * Used to share context between multiple resolvers
 */
export default class ContextProvider {
  private _context: Promise<JsonLdContextNormalized>;
  private parser = new ContextParser();

  /**
   * Creates a new resolver for the given context(s).
   */
  constructor(...contexts: JsonLdContext[]) {
    this._context = this.parser.parse([...contexts]);
  }

  /**
   * Extends the current context with the given context(s).
   */
  async extendContext(...contexts: JsonLdContext[]) {
    this._context = this._context.then(context => this.parser.parse([context.getContextRaw(), ...contexts]))
  }

  /**
   * @return The raw inner context
   */
  async getContextRaw(): Promise<IJsonLdContextNormalizedRaw> {
    return (await this._context).getContextRaw();
  }

  async expandTerm(term: string, expandVocab?: boolean, options?: IExpandOptions) {
    return (await this._context).expandTerm(term, expandVocab, options)
  }
}
