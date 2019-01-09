/**
 * Traverses a path to collect mutationExpressions into an expression.
 *
 * Requires:
 * - a mutationExpressions property on the path proxy
 */
export default class MutationExpressionsHandler {
  async execute(path) {
    let mutationExpressions = [];

    // Add all mutationExpressions to the path
    let current = path;
    while (current) {
      // Obtain and store mutationExpressions
      if (current.mutationExpressions)
        mutationExpressions = (await current.mutationExpressions).concat(mutationExpressions);

      // Move to parent link
      current = current.parent;
    }

    return mutationExpressions;
  }
}
