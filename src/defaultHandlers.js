import AsyncIteratorHandler from './AsyncIteratorHandler';
import DataHandler from './DataHandler';
import DeleteFunctionHandler from './DeleteFunctionHandler';
import ExecuteQueryHandler from './ExecuteQueryHandler';
import InsertFunctionHandler from './InsertFunctionHandler';
import MutationExpressionsHandler from './MutationExpressionsHandler';
import PathExpressionHandler from './PathExpressionHandler';
import PredicateHandler from './PredicateHandler';
import PredicatesHandler from './PredicatesHandler';
import PropertiesHandler from './PropertiesHandler';
import ReplaceFunctionHandler from './ReplaceFunctionHandler';
import SetFunctionHandler from './SetFunctionHandler';
import SortHandler from './SortHandler';
import SparqlHandler from './SparqlHandler';
import StringToLDflexHandler from './StringToLDflexHandler';
import SubjectHandler from './SubjectHandler';
import SubjectsHandler from './SubjectsHandler';
import PreloadHandler from './PreloadHandler';
import ThenHandler from './ThenHandler';

/**
 * A map with default property handlers.
 */
export default {
  // Flag to loaders that exported paths are not ES6 modules
  __esModule: () => undefined,

  // Add thenable and async iterable behavior
  then: new ThenHandler(),
  [Symbol.asyncIterator]: new AsyncIteratorHandler(),

  // Add read and query functionality
  subject: new SubjectHandler(),
  predicate: new PredicateHandler(),
  properties: new PropertiesHandler(),
  predicates: new PredicatesHandler(),
  pathExpression: new PathExpressionHandler(),
  sparql: new SparqlHandler(),
  subjects: new SubjectsHandler(),
  results: new ExecuteQueryHandler(),
  sort: new SortHandler('ASC'),
  sortDesc: new SortHandler('DESC'),
  preload: new PreloadHandler(),

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
