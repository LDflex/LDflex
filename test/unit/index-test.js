import * as ldflex from '../../src/index';

describe('The LDflex module', () => {
  const exports = [
    'ExecuteQueryHandler',
    'FallbackHandler',
    'JSONLDResolver',
    'PathExpressionHandler',
    'PathProxy',
    'PathFactory',
    'SparqlHandler',
    'StringToLDflexHandler',
    'defaultHandlers',
    'getIterator',
    'iterablePromise',
    'iterableToThen',
  ];

  exports.forEach(name => {
    it(`exports ${name}`, () => {
      expect(ldflex[name]).toBeInstanceOf(Object);
    });
  });
});
