const EMPTY_OBJECT = Object.create(null);

export default class QueryPath {
  constructor(options = {}, pathExpression, parent) {
    // public properties
    this.pathExpression = pathExpression;
    this.parent = parent;

    // private options
    const { resolvers = [] } = options;
    this._options = options;
    this._resolvers = resolvers;

    return new Proxy(EMPTY_OBJECT, this);
  }

  /**
   * Handles access to a property as a Proxy
   */
  get(queryPath, property) {
    // Find a resolver that can handle the property
    for (const resolver of this._resolvers) {
      if (resolver.supports(property))
        return resolver.resolve(this, property);
    }
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
