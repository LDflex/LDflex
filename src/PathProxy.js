const EMPTY = Object.create(null);

/**
 * A PathProxy creates path expressions,
 * to which functionality can be attached.
 *
 * To users, these paths act as regular JavaScript objects
 * (such as `path.foo.bar.prop`) thanks to Proxy.
 * Behind the scenes, they carry around internal data
 * that can be used to influence their functionality.
 *
 * A path's functionality is realized by:
 * - handlers, which handle a specific named property
 * - resolvers, which can handle arbitrary properties
 * Only handlers and resolvers see the internal data.
 *
 * A path can have arbitrary internal data fields, but these are reserved:
 * - proxy, a reference to the proxied object the user sees
 * - extend, a method to create a child path with this path as parent
 * - settings, an object that is passed on as-is to child paths
 * - parent, a reference to the parent path
 */
export default class PathProxy {
  constructor({ handlers = EMPTY, resolvers = [] } = {}) {
    this._handlers = handlers;
    this._resolvers = resolvers;
  }

  /**
   * Creates a path Proxy with the given settings and internal data fields.
   */
  createPath(settings = {}, data) {
    // The settings parameter is optional
    if (data === undefined)
      [data, settings] = [settings, {}];

    // Create the path's internal data object and the proxy that wraps it
    const path = { settings, ...data };
    const proxy = path.proxy = new Proxy(path, this);

    // Add an extend method to create child paths
    if (!path.extend) {
      const pathProxy = this;
      path.extend = function (newData) {
        const parent = this;
        const { extend } = this;
        return pathProxy.createPath(settings, { parent, extend, ...newData });
      };
    }

    // Return the proxied path
    return proxy;
  }

  /**
   * Handles access to a property
   */
  get(path, property) {
    // Handlers provide functionality for a specific property,
    // so check if we find a handler first
    const handler = this._handlers[property];
    if (handler && typeof handler.execute === 'function')
      return handler.execute(path, path.proxy);

    // Resolvers provide functionality for arbitrary properties,
    // so find a resolver that can handle this property
    for (const resolver of this._resolvers) {
      if (resolver.supports(property))
        return resolver.resolve(property, path, path.proxy);
    }

    // Otherwise, the property does not exist
    return undefined;
  }
}
