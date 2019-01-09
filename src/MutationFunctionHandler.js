/**
 * Returns a function that, when called with arguments,
 * extends the path with mutationExpressions.
 *
 * It uses the current path expression as domain
 * and the given arguments as range.
 * These arguments can either be raw, or other path expressions.
 *
 * Requires:
 * - a pathExpression property on the path proxy and all non-raw arguments.
 */
export default class MutationFunctionHandler {
  constructor(mutationType, allowZeroArgs) {
    this._mutationType = mutationType;
    this._allowZeroArgs = allowZeroArgs;
  }

  execute(path, proxy) {
    const self = this;
    return function () {
      const mutationExpressions = {
        then: (resolve, reject) =>
          self.createMutationExpressions(path, proxy, arguments).then(resolve, reject),
      };
      return path.extend({ mutationExpressions });
    };
  }

  async createMutationExpressions(path, proxy, args) {
    // Check if the given arguments are valid
    if (!this._allowZeroArgs && !args.length)
      throw new Error(`Mutation on ${path} can not be invoked without arguments`);

    // Check if we have a valid path
    const domainExpression = await proxy.pathExpression;
    if (!Array.isArray(domainExpression))
      throw new Error(`${path} has no pathExpression property`);

    // Require at least a subject and a link
    if (domainExpression.length < 2)
      throw new Error(`${path} should at least contain a subject and a predicate`);

    // If we have args, the range is defined by these args
    if (args.length) {
      // The last path segment represents the predicate of the triple to insert
      const predicate = domainExpression.splice(domainExpression.length - 1)[0].predicate;
      if (!predicate)
        throw new Error(`Expected predicate in ${path}`);

      // Determine right variables and patterns
      const mutationExpressions = [];
      for (let argument of args) {
        // If an argument does not expose a pathExpression, we consider it a raw value.
        let rangeExpression = await argument.pathExpression;
        if (!Array.isArray(rangeExpression))
          rangeExpression = [{ subject: `"${argument}"` }];

        // Store the domain, predicate and range in the insert expression.
        mutationExpressions.push({
          mutationType: this._mutationType,
          domainExpression,
          predicate,
          rangeExpression,
        });
      }

      return mutationExpressions;
    }

    // If we don't have args, the range simply corresponds to the domain,
    // so we don't store the range and predicate explicitly.
    return [{
      mutationType: this._mutationType,
      domainExpression,
    }];
  }
}
