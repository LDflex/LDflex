import PathExpressionHandler from './PathExpressionHandler';
import InsertFunctionHandler from './InsertFunctionHandler';
import DeleteFunctionHandler from './DeleteFunctionHandler';
import MutationExpressionsHandler from './MutationExpressionsHandler';
import ReplaceFunctionHandler from './ReplaceFunctionHandler';
import SetFunctionHandler from './SetFunctionHandler';
import ExecuteQueryHandler from './ExecuteQueryHandler';
import SparqlHandler from './SparqlHandler';
import DataHandler from './DataHandler';
import StringToLDflexHandler from './StringToLDflexHandler';
import { createThen, createIterator } from './iterableUtils';

// Create default query handler
const queryHandler = new ExecuteQueryHandler();

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
      if (!subject.then)
        return undefined;
      // Return a new path with the resolved subject
      return (onResolved, onRejected) => subject
        .then(term => path.extend({ subject: term }, null))
        .then(onResolved, onRejected);
    }
    // Otherwise, execute the query represented by this path
    return createThen(queryHandler.execute(path, pathProxy));
  },

  // Add async iterable behavior
  [Symbol.asyncIterator]: (path, pathProxy) => {
    // If a direct subject is set (zero-length path),
    // return an iterator with the subject as only element
    const { subject } = path;
    if (subject) {
      return () => createIterator(Promise.resolve(subject)
        .then(term => path.extend({ subject: term }, null)));
    }
    // Otherwise, execute the query represented by this path
    return () => queryHandler.execute(path, pathProxy)[Symbol.asyncIterator]();
  },

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
