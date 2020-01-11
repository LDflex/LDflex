import * as ldflex from '../../src/index';

describe('The LDflex module', () => {
  const exports = [
    'AsyncIteratorHandler',
    'DataHandler',
    'DeleteFunctionHandler',
    'ExecuteQueryHandler',
    'InsertFunctionHandler',
    'JSONLDResolver',
    'MutationExpressionsHandler',
    'MutationFunctionHandler',
    'PathExpressionHandler',
    'PathFactory',
    'PathProxy',
    'PredicateHandler',
    'PredicatesHandler',
    'PreloadHandler',
    'PropertiesHandler',
    'ReplaceFunctionHandler',
    'SetFunctionHandler',
    'SortHandler',
    'SparqlHandler',
    'StringToLDflexHandler',
    'SubjectHandler',
    'SubjectsHandler',
    'ThenHandler',
    'ToArrayHandler',
    'defaultHandlers',
    'getFirstItem',
    'getThen',
    'iteratorFor',
    'lazyThenable',
    'toIterablePromise',
  ];

  exports.forEach(name => {
    it(`exports ${name}`, () => {
      expect(ldflex[name]).toBeInstanceOf(Object);
    });
  });
});
