const EMPTY_OBJECT = Object.create(null);

export default class QueryPath {
  constructor({ resolvers = [] } = {}) {
    this._resolvers = resolvers;
    return new Proxy(EMPTY_OBJECT, this);
  }

  // Handle property access
  get(queryPath, property) {
    // Find a resolver that can handle the property
    for (const resolver of this._resolvers) {
      if (resolver.supports(property))
        return resolver.resolve(this, property);
    }
    throw new Error(`Cannot resolve property '${property}'`);
  }
}
