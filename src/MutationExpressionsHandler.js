/**
 * Returns the mutationExpressions of path segment.
 *
 * Requires:
 * - a mutationExpressions property on the path proxy
 */
export default class MutationExpressionsHandler {
  execute({ mutationExpressions }) {
    return mutationExpressions;
  }
}
