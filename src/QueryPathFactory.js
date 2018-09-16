import QueryPath from './QueryPath.js';
import PathExpressionHandler from './PathExpressionHandler.js';
import ExecuteQueryHandler from './ExecuteQueryHandler.js';
import SparqlHandler from './SparqlHandler.js';
import JSONLDResolver from './JSONLDResolver.js';

const DEFAULT_HANDLERS = {
  pathExpression: new PathExpressionHandler(),
  sparql: new SparqlHandler(),
  then: new ExecuteQueryHandler({ single: true }),
  [Symbol.asyncIterator]: new ExecuteQueryHandler(),
};

/**
 * A QueryPathFactory creates QueryPath instances with default settings.
 */
export default class QueryPathFactory {
  constructor(settings, data) {
    // Complete settings object
    settings = Object.assign(Object.create(null), settings);
    if (!settings.handlers)
      settings.handlers = DEFAULT_HANDLERS;
    if (!settings.resolvers)
      settings.resolvers = [];
    if (settings.context)
      settings.resolvers.push(new JSONLDResolver(settings.context));

    this._settings = settings;
    this._data = data;
  }

  /**
   * Creates a QueryPath with the given (optional) settings and data.
   */
  create(settings = {}, data) {
    // The settings parameter is optional
    if (!data)
      [data, settings] = [settings, null];

    // Apply defaults on settings and data
    return new QueryPath(
      Object.assign(Object.create(null), this._settings, settings),
      Object.assign(Object.create(null), this._data, data));
  }
}
