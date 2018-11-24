/**
 * Returns the subject of a path segment.
 *
 * Requires:
 * - a subject property on the path proxy
 */
export default class PathExpressionHandler {
  execute({ subject }) {
    return subject && Promise.resolve(subject);
  }
}
