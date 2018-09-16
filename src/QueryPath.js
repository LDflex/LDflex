const EMPTY = Object.create(null);

export default class QueryPath {
  constructor(options = {}, pathExpression, parent) {
    // public properties
    this.pathExpression = pathExpression;
    this.parent = parent;

    // private options
    const { handlers = EMPTY, resolvers = [] } = options;
    this._options = options;
    this._resolvers = resolvers;

    return new Proxy(handlers, this);
  }

  /**
   * Handles access to a property as a Proxy
   */
  get(handlers, property) {
    // Handlers provide functionality for a specific property,
    // so check if we find a handler first
    const handler = handlers[property];
    if (handler && typeof handler.execute === 'function')
      return handler.execute(this);

    // Resolvers provide functionality for arbitrary properties,
    // so find a resolver that can handle this property
    for (const resolver of this._resolvers) {
      if (resolver.supports(property))
        return resolver.resolve(this, property);
    }

    // Error if no adequate resolver was found
    throw new Error(`Cannot resolve property '${property}'`);
  }

  /**
   * Extends the current path with a new one.
   * The given expression expresses their relation.
   */
  extend(pathExpression) {
    return new QueryPath(this._options, pathExpression, this);
  }
}
