import PathProxy from './PathProxy';
import PathExpressionHandler from './PathExpressionHandler';
import InsertFunctionHandler from './InsertFunctionHandler';
import DeleteFunctionHandler from './DeleteFunctionHandler';
import MutationExpressionsHandler from './MutationExpressionsHandler';
import ReplaceFunctionHandler from './ReplaceFunctionHandler';
import SetFunctionHandler from './SetFunctionHandler';
import ExecuteQueryHandler from './ExecuteQueryHandler';
import SparqlHandler from './SparqlHandler';
import JSONLDResolver from './JSONLDResolver';
import FallbackHandler from './FallbackHandler';
import DataHandler from './DataHandler';
import StringToLDflexHandler from './StringToLDflexHandler';
import SubjectHandler from './SubjectHandler';
import { promiseToIterable, getIterator, iterableToThen } from './iterableUtils';
import * as dataFactory from '@rdfjs/data-model';

// Default iterator behavior:
// - first try returning the subject (single-segment path)
// - then execute a path query (multi-segment path)
const iteratorHandler = new FallbackHandler([
  promiseToIterable(new SubjectHandler()),
  new ExecuteQueryHandler(),
]);

/**
 * Collection of default property handlers.
 */
export const defaultHandlers = {
  // Flag to loaders that exported paths are not ES6 modules
  __esModule: () => undefined,

  // Add iterable and thenable behavior
  [Symbol.asyncIterator]: getIterator(iteratorHandler),
  then: iterableToThen(iteratorHandler),

  // Add path handling
  pathExpression: new PathExpressionHandler(),
  add: new InsertFunctionHandler(),
  delete: new DeleteFunctionHandler(),
  mutationExpressions: new MutationExpressionsHandler(),
  replace: new ReplaceFunctionHandler(),
  set: new SetFunctionHandler(),
  sparql: new SparqlHandler(),

  // Add RDFJS term handling
  termType: DataHandler.sync('subject', 'termType'),
  value: DataHandler.sync('subject', 'value'),
  equals: DataHandler.sync('subject', 'equals'),
  language: DataHandler.sync('subject', 'language'),
  datatype: DataHandler.sync('subject', 'datatype'),
  toString: DataHandler.syncFunction('subject', 'value'),
  toPrimitive: DataHandler.syncFunction('subject', 'value'),

  // Parse a string into an LDflex object
  resolve: new StringToLDflexHandler(),
};

/**
 * A PathFactory creates paths with default settings.
 */
export default class PathFactory {
  constructor(settings, data) {
    // Store settings and data
    settings = { dataFactory, ...settings };
    this._settings = settings;
    this._data = data;

    // Prepare the handlers
    const handlers = (settings.handlers || PathFactory.defaultHandlers);
    for (var key in handlers)
      handlers[key] = toHandler(handlers[key]);

    // Prepare the resolvers
    const resolvers = (settings.resolvers || []).map(toResolver);
    if (settings.context)
      resolvers.push(new JSONLDResolver(settings.context));

    // Instantiate PathProxy that will create the paths
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
PathFactory.defaultHandlers = defaultHandlers;

/**
 * Converts a handler function into a handler object.
 */
export function toHandler(execute) {
  return typeof execute.execute === 'function' ? execute : { execute };
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
