import PathProxy from './PathProxy';
import JSONLDResolver from './JSONLDResolver';
import defaultHandlers from './defaultHandlers';
import { ContextParser } from 'jsonld-context-parser';

/**
 * A PathFactory creates paths with default settings.
 */
export default class PathFactory {
  constructor(settings, data) {
    // Store settings and data
    this._settings = settings = { ...settings };
    this._data = data = { ...data };

    // Prepare the handlers
    const handlers = settings.handlers || defaultHandlers;
    for (const key in handlers)
      handlers[key] = toHandler(handlers[key]);
    for (const key of Object.getOwnPropertySymbols(handlers))
      handlers[key] = toHandler(handlers[key]);

    // Prepare the resolvers
    const resolvers = (settings.resolvers || []).map(toResolver);
    if (settings.context) {
      resolvers.push(new JSONLDResolver(settings.context));
      settings.parsedContext = new ContextParser().parse(settings.context);
    }
    else {
      settings.context = settings.parsedContext = {};
    }

    // Instantiate PathProxy that will create the paths
    this._pathProxy = new PathProxy({ handlers, resolvers });

    // Remove PathProxy settings from the settings object
    delete settings.handlers;
    delete settings.resolvers;
  }

  /**
   * Creates a path with the given (optional) settings and data.
   */
  create(settings = {}, data) {
    // The settings parameter is optional
    if (!data)
      [data, settings] = [settings, null];

    // Apply defaults on settings and data
    return this._pathProxy.createPath(
      Object.assign(Object.create(null), this._settings, settings),
      Object.assign(Object.create(null), this._data, data));
  }
}
PathFactory.defaultHandlers = defaultHandlers;

/**
 * Converts a handler function into a handler object.
 */
export function toHandler(handle) {
  return typeof handle.handle === 'function' ? handle : { handle };
}

/**
 * Converts a resolver function into a catch-all resolver object.
 */
export function toResolver(resolve) {
  return typeof resolve.resolve === 'function' ? resolve : { supports, resolve };
}

// Catch-all resolvers support everything
function supports() {
  return true;
}
