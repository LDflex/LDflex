import DataHandler from './DataHandler';
import PathExpressionHandler from './PathExpressionHandler';
import SparqlHandler from './SparqlHandler';
import ExecuteQueryHandler from './ExecuteQueryHandler';
import MutationExpressionsHandler from './MutationExpressionsHandler';
import InsertFunctionHandler from './InsertFunctionHandler';
import SetFunctionHandler from './SetFunctionHandler';
import ReplaceFunctionHandler from './ReplaceFunctionHandler';
import DeleteFunctionHandler from './DeleteFunctionHandler';
import StringToLDflexHandler from './StringToLDflexHandler';
import { getFirstItem, iteratorFor } from './iterableUtils';
import { getThen } from './promiseUtils';

/**
 * A map with default property handlers.
 */
export default {
  // Flag to loaders that exported paths are not ES6 modules
  __esModule: () => undefined,

  // Add Promise behavior
  then: (path, pathProxy) => {
    // If a direct subject is set (zero-length path), resolve it
    const { subject } = path;
    if (subject) {
      // If the subject is not a promise, it has already been resolved;
      // consumers should not await it, but access its properties directly.
      // This avoids infinite `then` chains when awaiting this path.
      return subject.then &&
      // Return a new path with the resolved subject
        getThen(() => subject
          .then(term => path.extend({ subject: term }, null)));
    }
    // Otherwise, return the first result of this path
    return getThen(() => getFirstItem(pathProxy.results));
  },

  // Add async iterable behavior
  [Symbol.asyncIterator]: (path, pathProxy) => {
    // If a direct subject is set (zero-length path),
    // return an iterator with the subject as only element
    const { subject } = path;
    if (subject) {
      return () => iteratorFor(Promise.resolve(subject)
        .then(term => path.extend({ subject: term }, null)));
    }
    // Otherwise, return the results of this path
    return () => pathProxy.results[Symbol.asyncIterator]();
  },

  // Add query functionality
  pathExpression: new PathExpressionHandler(),
  sparql: new SparqlHandler(),
  results: new ExecuteQueryHandler(),

  // Add write functionality
  mutationExpressions: new MutationExpressionsHandler(),
  add: new InsertFunctionHandler(),
  set: new SetFunctionHandler(),
  replace: new ReplaceFunctionHandler(),
  delete: new DeleteFunctionHandler(),

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
