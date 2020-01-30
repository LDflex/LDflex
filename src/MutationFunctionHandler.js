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
    // The arguments are the affected objects
    // Do this first since an object input can change the conditions
    let objects;
    if (args.length === 1 && this.isObject(args[0])) {
      objects = Object.keys(args[0]).map(key => {
        let values = args[0][key];
        // Simulate the function being called with no arguments
        if (values === null || values === undefined)
          values = [];
        // Shortcut for single arguments
        else if (!Array.isArray(values))
          values = [values];
        // Currently the path value is only used by the SolidDeleteFunctionHandlers in query-ldflex
        // and needs to be updated to be the correct path there.
        // pathData still matches the old path though.
        return { key, value: this.extractObjects(pathData, path[key], values) };
      });
    }
    else {
      objects = await this.extractObjects(pathData, path, args);
    }
    // If no objects were specified, mutate all objects in the domain
    const mutationType = this._mutationType;
    if (!objects)
      return [{ mutationType, conditions: await path.pathExpression }];
    // No need to continue if there are no objects to mutate
    if (objects.length === 0)
      return [{ objects: [] }];

    // Check if the input was an object map
    const hasObjects = !objects[0].termType;

    if (hasObjects) {
      // Make sure promise structure is the same as when there are no objects
      return Promise.all(objects.map(async obj => {
        const conditions = await path[obj.key].pathExpression;
        return this.createMutationExpression(pathData, conditions, await obj.value);
      }));
    }

    const conditions = await path.pathExpression;
    return [this.createMutationExpression(pathData, conditions, objects)];
  }

  createMutationExpression(pathData, conditions, objects) {
    // Check if we have a valid path
    if (!Array.isArray(conditions))
      throw new Error(`${pathData} has no pathExpression property`);
    if (conditions.length < 2)
      throw new Error(`${pathData} should at least contain a subject and a predicate`);

    // Otherwise, use the previous predicate
    const { predicate } = conditions[conditions.length - 1];
    if (!predicate)
      throw new Error(`Expected predicate in ${pathData}`);
    return { mutationType: this._mutationType, conditions: conditions.slice(0, conditions.length - 1), predicate, objects };
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

  isObject(arg) {
    if (!arg)
      return false;
    if (typeof arg === 'string')
      return false;
    if (arg.termType)
      return false;
    if (arg[Symbol.asyncIterator])
      return false;
    return true;
  }

  extractObject(pathData, path, arg) {
    if (typeof arg === 'string')
      return literal(arg);
    if (arg && arg.termType)
      return arg;
    throw new Error(`Invalid object: ${arg}`);
  }
}
