/**
 * Returns the subject of a path segment.
 *
 * Requires:
 * - a subject property on the path proxy
 */
export default class SubjectHandler {
  execute(path, proxy) {
    return path.subject && Promise.resolve(proxy);
  }
}
