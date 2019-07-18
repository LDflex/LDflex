/**
 * Queries for all predicates of a path subject
 */
export default class PredicatesHandler {
  handle(pathData) {
    return pathData.extendPath({
      distinct: true,
      select: '?predicate',
      finalClause: queryVar => `${queryVar} ?predicate ?object.`,
      property: pathData.property,
    });
  }
}
