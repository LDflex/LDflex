import { lazyThenable } from './promiseUtils';
import { iterableToArray } from './iterableUtils';
import {
  ensureArray, joinArrays,
  valueToTerm, hasPlainObjectArgs, isAsyncIterable,
} from './valueUtils';

/**
 * Returns a function that, when called with arguments,
 * extends the path with mutationExpressions.
 *
 * Mutation functions can be called in two equivalent ways:
 * - path.property.set(object, object)
 * - path.set({ property: [object, object] })
 * Objects can be strings, terms, or path expressions.
 * The second syntax allows setting multiple properties at once.
 * It also has `null` and `undefined` as shortcuts for the empty array,
 * and a direct value as shortcut for a single-valued array.
 *
 * Requires:
 * - a pathExpression property on the path proxy and all non-raw arguments.
 */
export default class MutationFunctionHandler {
  constructor(mutationType, allowZeroArgs) {
    this._mutationType = mutationType;
    this._allowZeroArgs = allowZeroArgs;
  }

  // Creates a function that performs a mutation
  handle(pathData, path) {
    return (...args) => {
      // Check if the given arguments are valid
      if (!this._allowZeroArgs && !args.length)
        throw new Error('Mutation cannot be invoked without arguments');

      // Create a lazy Promise to the mutation expressions
      const mutationExpressions = lazyThenable(() =>
        this.createMutationExpressions(pathData, path, args));
      return pathData.extendPath({ mutationExpressions });
    };
  }

  // Creates expressions that represent the requested mutation
  async createMutationExpressions(pathData, path, args) {
    // The mutation targets a single property on the path by passing objects
    if (!hasPlainObjectArgs(args))
      return [await this.createMutationExpression(pathData, path, args)];

    // The mutation targets multiple properties through a map of property-objects pairs
    const pairs = Object.entries(args[0]);
    const expressions = await Promise.all(pairs.map(([property, values]) =>
      this.createMutationExpression(pathData, path[property], ensureArray(values))));
    // Group expressions together to maintain the same structure as the singular case
    // (All properties have the same parent path, and hence the same condition)
    return [expressions.length === 0 ? {} : {
      ...expressions[0],
      predicateObjects: joinArrays(expressions.map(e => e.predicateObjects)),
    }];
  }

  // Creates an expression that represents a mutation with the given objects
  async createMutationExpression(pathData, path, values) {
    // Obtain the path segments, which are the selection conditions for the mutation
    const conditions = await path.pathExpression;
    if (!Array.isArray(conditions))
      throw new Error(`${pathData} has no pathExpression property`);
    if (conditions.length < 2)
      throw new Error(`${pathData} should at least contain a subject and a predicate`);

    // Obtain the predicate and target objects
    const { predicate, reverse } = conditions[conditions.length - 1];
    if (!predicate)
      throw new Error(`Expected predicate in ${pathData}`);
    const objects = await this.extractObjects(pathData, path, values);

    // Create a mutation, unless no objects are affected (`null` means all)
    return objects !== null && objects.length === 0 ? {} : {
      mutationType: this._mutationType,
      conditions: conditions.slice(0, -1),
      predicateObjects: [{ predicate, reverse, objects }],
    };
  }

  // Extracts individual objects from a set of values passed to a mutation function
  async extractObjects(pathData, path, values) {
    // If no specific values are specified, match all (represented by `null`)
    if (values.length === 0)
      return null;

    // Otherwise, expand singular values, promises, and paths
    const objects = [];
    for (const value of values) {
      if (!isAsyncIterable(value))
      // Add a (promise to) a single value
        objects.push(await value);
      // Add multiple values from a path
      else
        objects.push(...(await iterableToArray(value)));
    }
    return objects.map(valueToTerm);
  }
}
