import DataHandler from './DataHandler';
import SubjectHandler from './SubjectHandler';
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
  then: ({ subject }, pathProxy) => {
    // If a direct subject is set (zero-length path), resolve it
    if (subject)
      // If the subject is not a promise, it has already been resolved;
      // consumers should not await it, but access its properties directly.
      // This avoids infinite `then` chains when awaiting this path.
      return subject.then && getThen(() => pathProxy.subject);
    // Otherwise, return the first result of this path
    return getThen(() => getFirstItem(pathProxy.results));
  },

  // Add async iterable behavior
  [Symbol.asyncIterator]: ({ subject }, pathProxy) =>
    // Return a one-item iterator of the subject or,
    // if no subject is present, all results of this path
    () => subject ?
      iteratorFor(pathProxy.subject) :
      pathProxy.results[Symbol.asyncIterator](),

  // Add read and query functionality
  subject: new SubjectHandler(),
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
