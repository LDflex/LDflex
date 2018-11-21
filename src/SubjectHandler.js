/**
 * Returns the subject of a path segment.
 *
 * Requires:
 * - a subject property on the path proxy
 */
export default class PathExpressionHandler {
  async execute({ subject }) {
    return subject;
  }
}
