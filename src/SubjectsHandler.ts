import { Handler } from "./types";

/**
 * Queries for all subjects of a document
 */
export default class SubjectsHandler implements Handler {
  handle(pathData) {
    return pathData.extendPath({
      distinct: true,
      select: '?subject',
      finalClause: () => '?subject ?predicate ?object.',
      property: pathData.property,
    });
  }
}
