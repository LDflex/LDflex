/**
 * Queries for all compacted predicates of a path subject
 */
import { ContextParser } from 'jsonld-context-parser';
import { toIterablePromise } from './promiseUtils';

export default class PropertiesHandler {
  handle(pathData, path) {
    return toIterablePromise(this._handle(pathData, path));
  }

  async* _handle(pathData, path) {
    const context = (await pathData.settings.parsedContext) || {};
    for await (const predicate of path.predicates)
      yield ContextParser.compactIri(`${await predicate}`, context, true);
  }
}
