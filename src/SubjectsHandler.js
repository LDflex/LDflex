/**
 * Queries for all predicates of a path subject
 */
export default class SubjectsHandler {
  handle(pathData) {
    return pathData.extendPath({
      distinct: true,
      select: '?subject',
      finalClause: () => '?subject ?predicate ?object.',
      property: pathData.property,
    });
  }
}
