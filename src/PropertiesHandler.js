/**
 * Queries for all compacted predicates of a path subject
 *
 */
import { ContextParser } from 'jsonld-context-parser';

export default class PropertiesHandler {
  async* handle(pathData, path, context) {
    for await (const predicate of path.predicates)
      yield ContextParser.compactIri(`${await predicate}`, await context, true);
  }
}
