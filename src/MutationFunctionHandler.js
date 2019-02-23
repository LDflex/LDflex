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

    // Create range expressions based on the arguments
    const rangeExpressions = await this.createRangeExpressions(pathData, path, args);

    // If there are no expressions, the range simply corresponds to the domain
    const mutationType = this._mutationType;
    if (!rangeExpressions)
      return [{ mutationType, domainExpression }];

    // Otherwise, the expression takes the predicate of the last path segment
    const { predicate } = domainExpression.pop();
    if (!predicate)
      throw new Error(`Expected predicate in ${pathData}`);
    return rangeExpressions.map(rangeExpression =>
      ({ mutationType, domainExpression, predicate, rangeExpression }));
  }

  createRangeExpressions(pathData, path, args) {
    return args.length === 0 ? null : Promise.all(args.map(async arg => {
      // If the argument does not have a path expression, it should be an RDF term
      const rangeExpression = await arg.pathExpression;
      return Array.isArray(rangeExpression) ? rangeExpression :
        [{ subject: arg.termType ? arg : literal(arg) }];
    }));
  }
}
