import * as ldflex from '../../src/index';

describe('The LDflex module', () => {
  const exports = [
    'ExecuteQueryHandler',
    'JSONLDResolver',
    'PathExpressionHandler',
    'QueryPath',
    'SparqlHandler',
  ];

  exports.forEach(name => {
    it(`exports ${name}`, () => {
      expect(ldflex[name]).toBeInstanceOf(Object);
    });
  });
});
