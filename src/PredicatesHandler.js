/**
 * Queries for all predicates of a path subject
 */
export default class PredicatesHandler {
  handle(pathData) {
    return pathData.extendPath({ finalClause: this.finalClause, select: '?predicate', distinct: true, property: pathData.property });
  }

  finalClause(queryVar) {
    return `\n  ${queryVar} ?predicate ?object.`;
  }
}
