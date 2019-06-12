/**
 * Queries for all predicates of a path subject
 *
 */
export default class PropertiesHandler {
  handle(pathData) {
    return pathData.extendPath({ finalClause: PropertiesHandler.finalClause, select: '?p', distinct: true, property: pathData.property });
  }

  static finalClause(queryVar) {
    return `\n  ${queryVar} ?p ?x.`;
  }
}
