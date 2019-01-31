import { literal } from '@rdfjs/data-model';
import { getThen } from './promiseUtils';

/**
 * Returns a function that, when called with arguments,
 * extends the path with mutationExpressions.
 *
 * It uses the current path expression as domain expression
 * and the given arguments as range expression.
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

  handle(pathData, path) {
    return (...args) => {
      // Check if the given arguments are valid
      if (!this._allowZeroArgs && !args.length)
        throw new Error(`Mutation on ${pathData} can not be invoked without arguments`);

      // Create a lazy Promise to the mutation expressions
      const then = getThen(() => this.createMutationExpressions(pathData, path, args));
      return pathData.extendPath({ mutationExpressions: { then } });
    };
  }

  async createMutationExpressions(pathData, path, args) {
    // Check if we have a valid path
    const domainExpression = await path.pathExpression;
    if (!Array.isArray(domainExpression))
      throw new Error(`${pathData} has no pathExpression property`);

    // Require at least a subject and a link
    if (domainExpression.length < 2)
      throw new Error(`${pathData} should at least contain a subject and a predicate`);

    // If we have args, each arg defines a mutation expression with a certain range expression.
    if (args.length) {
      // The last path segment represents the predicate of the triple to insert
      const { predicate } = domainExpression.pop();
      if (!predicate)
        throw new Error(`Expected predicate in ${pathData}`);

      // Determine right variables and patterns
      const mutationExpressions = [];
      for (let argument of args) {
        // If an argument does not expose a pathExpression, we consider it a raw value.
        let rangeExpression = await argument.pathExpression;
        if (!Array.isArray(rangeExpression)) {
          // If the argument is not an RDFJS term, assume it is a literal
          if (!argument.termType)
            argument = literal(argument);

          rangeExpression = [{ subject: argument }];
        }

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
