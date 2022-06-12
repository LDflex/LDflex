import { Handler, PathData } from "./types";

/**
 * Queries for all predicates of a path subject
 */
export default class PredicatesHandler implements Handler {
  handle(pathData: PathData) {
    return pathData.extendPath({
      distinct: true,
      select: '?predicate',
      finalClause: queryVar => `${queryVar} ?predicate ?object.`,
      property: pathData.property,
    });
  }
}
