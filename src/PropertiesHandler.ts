/**
 * Queries for all compacted predicates of a path subject
 */
import { JsonLdContextNormalized } from 'jsonld-context-parser';
import { toIterablePromise } from './promiseUtils';
import { Handler } from './types';

export default class PropertiesHandler implements Handler {
  handle(pathData, path) {
    return toIterablePromise(this._handle(pathData, path));
  }

  async* _handle(pathData, path) {
    const contextRaw = (await pathData.settings.parsedContext) || {};
    // TODO: See if we can just use the normalized context. This seems like unecessarily repeated behvaior
    const context = new JsonLdContextNormalized(contextRaw);
    for await (const predicate of path.predicates)
      yield context.compactIri(`${await predicate}`, true);
  }
}
