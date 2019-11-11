import { getThen } from './promiseUtils';
import { getFirstItem } from './iterableUtils';

/**
 * Thenable handler that resolves to either the subject
 * of the first item of the results.
 *
 * Requires:
 *  - (optional) a subject on the path data
 *  - (optional) a subject on the path proxy
 *  - (optional) results on the path proxy
 */
export default class ThenHandler {
  handle({ subject }, pathProxy) {
    // Resolve to either the subject (zero-length path) or the first result
    return subject ?
      // If the subject is not a promise, it has already been resolved;
      // consumers should not resolve it, but access its properties directly.
      // This avoids infinite `then` chains when `await`ing this path.
      subject.then && getThen(() => pathProxy.subject) :
      // Otherwise, return the first result of this path
      getThen(() => getFirstItem(pathProxy.results));
  }
}
