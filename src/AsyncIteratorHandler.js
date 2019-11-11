import { iteratorFor } from './iterableUtils';

/**
 * AsyncIterator handler that yields either the subject or all results.
 *
 * Requires:
 *  - (optional) a subject on the path data
 *  - (optional) a subject on the path proxy
 *  - (optional) results on the path proxy
 */
export default class AsyncIteratorHandler {
  handle({ subject }, pathProxy) {
    // Return a one-item iterator of the subject if present;
    // otherwise, return all results of this path
    return subject ?
      () => iteratorFor(pathProxy.subject) :
      () => pathProxy.results[Symbol.asyncIterator]();
  }
}
