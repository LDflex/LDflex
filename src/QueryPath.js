const EMPTY = Object.create(null);

/**
 * A QueryPath is a generic data structure
 * that can be manipulated through _handlers_
 * (providing functionality for specific properties)
 * and _resolvers_
 * (providing functionality for arbitrary properties).
 */
export default class QueryPath {
  constructor(settings = {}, data = {}) {
    // Set data fields
    Object.assign(this, data);

    // Create proxy object
    const { handlers = EMPTY, resolvers = [] } = settings;
    this.settings = settings;
    this._handlers = handlers;
    this._resolvers = resolvers;
    return new Proxy({}, this);
  }

  /**
   * Handles access to a property as a Proxy
   */
  get(source, property) {
    // Handlers provide functionality for a specific property,
    // so check if we find a handler first
    const handler = this._handlers[property];
    if (handler && typeof handler.execute === 'function')
      return handler.execute(this);

    // Resolvers provide functionality for arbitrary properties,
    // so find a resolver that can handle this property
    for (const resolver of this._resolvers) {
      if (resolver.supports(property))
        return resolver.resolve(this, property);
    }

    // Otherwise, the property does not exist
    return undefined;
  }

  /**
   * Extends the current path with a new one.
   */
  extend(data) {
    return new QueryPath(this.settings,
      Object.assign({ parent: this }, data));
  }
}
