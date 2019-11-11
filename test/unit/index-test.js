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
    'PredicatesHandler',
    'PropertiesHandler',
    'ReplaceFunctionHandler',
    'SetFunctionHandler',
    'SortHandler',
    'SparqlHandler',
    'StringToLDflexHandler',
    'SubjectHandler',
    'SubjectsHandler',
    'ThenHandler',
    'defaultHandlers',
    'getFirstItem',
    'getThen',
    'iteratorFor',
    'toIterablePromise',
  ];

  exports.forEach(name => {
    it(`exports ${name}`, () => {
      expect(ldflex[name]).toBeInstanceOf(Object);
    });
  });
});
