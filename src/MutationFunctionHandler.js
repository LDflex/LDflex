import { literal } from '@rdfjs/data-model';
import { lazyThenable } from './promiseUtils';

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
      const mutationExpressions = lazyThenable(() =>
        this.createMutationExpressions(pathData, path, args));
      return pathData.extendPath({ mutationExpressions });
    };
  }

  async createMutationExpressions(pathData, path, args) {
    // Check if we have a valid path
    const conditions = await path.pathExpression;
    if (!Array.isArray(conditions))
      throw new Error(`${pathData} has no pathExpression property`);
    if (conditions.length < 2)
      throw new Error(`${pathData} should at least contain a subject and a predicate`);

    // The arguments are the affected objects
    const objects = await this.extractObjects(pathData, path, args);
    // If no objects were specified, mutate all objects in the domain
    const mutationType = this._mutationType;
    if (!objects)
      return [{ mutationType, conditions }];
    // If no objects are affected, do not perform any mutations
    if (objects.length === 0)
      return [];

    // Otherwise, mutate the affected objects
    const { predicate } = conditions.pop();
    if (!predicate)
      throw new Error(`Expected predicate in ${pathData}`);
    return [{ mutationType, conditions, predicate, objects }];
  }

  async extractObjects(pathData, path, args) {
    // No arguments means a wildcard
    if (args.length === 0)
      return null;

    // Expand strings, promises, and paths
    const objects = [];
    for (const arg of args) {
      // Process an asynchronously iterable argument
      if (arg && arg[Symbol.asyncIterator]) {
        for await (const item of arg)
          objects.push(this.extractObject(pathData, path, item));
      }
      else {
        // Process a (promise to) a string or term
        objects.push(this.extractObject(pathData, path, await arg));
      }
    }
    return objects;
  }

  extractObject(pathData, path, arg) {
    if (typeof arg === 'string')
      return literal(arg);
    if (arg && arg.termType)
      return arg;
    throw new Error(`Invalid object: ${arg}`);
  }
}
