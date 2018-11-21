import PathProxy from './PathProxy';
import PathExpressionHandler from './PathExpressionHandler';
import ExecuteQueryHandler from './ExecuteQueryHandler';
import SparqlHandler from './SparqlHandler';
import JSONLDResolver from './JSONLDResolver';
import FallbackHandler from './FallbackHandler';
import SubjectHandler from './SubjectHandler';
import toSingularHandler from './toSingularHandler';

// Default iterator behavior:
// - first try returning the subject (single-segment path)
// - then execute a path query (multi-segment path)
const iteratorHandler = new FallbackHandler([
  new SubjectHandler(),
  new ExecuteQueryHandler(),
]);

// Collection of default property handlers
const defaultHandlers = {
  pathExpression: new PathExpressionHandler(),
  sparql: new SparqlHandler(),
  [Symbol.asyncIterator]: iteratorHandler,
  then: toSingularHandler(iteratorHandler),
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
    const handlers = settings.handlers || defaultHandlers;
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
