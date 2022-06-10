/**
 * Queries for all compacted predicates of a path subject
 */
import { JsonLdContextNormalized } from 'jsonld-context-parser';
import { toIterablePromise } from './promiseUtils';

export default class PropertiesHandler {
  handle(pathData, path) {
    return toIterablePromise(this._handle(pathData, path));
  }

  async* _handle(pathData, path) {
    const contextRaw = (await pathData.settings.parsedContext) || {};
    const context = new JsonLdContextNormalized(contextRaw);
    for await (const predicate of path.predicates)
      yield context.compactIri(`${await predicate}`, true);
  }
}
