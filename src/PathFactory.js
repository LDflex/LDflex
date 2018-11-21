import PathProxy from './PathProxy.js';
import PathExpressionHandler from './PathExpressionHandler.js';
import ExecuteQueryHandler from './ExecuteQueryHandler.js';
import SparqlHandler from './SparqlHandler.js';
import JSONLDResolver from './JSONLDResolver.js';
import toSingularHandler from './toSingularHandler';

const queryHandler = new ExecuteQueryHandler();

const DEFAULT_HANDLERS = {
  pathExpression: new PathExpressionHandler(),
  sparql: new SparqlHandler(),
  [Symbol.asyncIterator]: queryHandler,
  then: toSingularHandler(queryHandler),
};

/**
 * A PathFactory creates paths with default settings.
 */
export default class PathFactory {
  constructor(settings, data) {
    settings = Object.assign(Object.create(null), settings);
    this._settings = settings;
    this._data = data;

    // Instantiate PathProxy that will create the paths
    const handlers = settings.handlers || DEFAULT_HANDLERS;
    const resolvers = settings.resolvers || [];
    if (settings.context)
      resolvers.push(new JSONLDResolver(settings.context));
    this._pathProxy = new PathProxy({ handlers, resolvers });

    // Remove PathProxy settings from the settings object
    delete settings.handlers;
    delete settings.resolvers;
    delete settings.context;
  }

  /**
   * Creates a PathProxy with the given (optional) settings and data.
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
