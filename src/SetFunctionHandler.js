import MutationFunctionHandler from './MutationFunctionHandler';

/**
 * Returns a function that deletes all existing values
 * for the path, and then adds the given values to the path.
 *
 * Requires:
 * - a delete function on the path proxy.
 * - an add function on the path proxy.
 */
export default class SetFunctionHandler extends MutationFunctionHandler {
  handle(pathData, path) {
    return (...args) => {
      // Don't support object maps with multiple arguments
      if (args.length !== 1 || !this.isObject(args[0])) {
        if (args.some(arg => this.isObject(arg)))
          throw new Error('Object maps can only appear as a single argument');
        return path.delete().add(...args);
      }

      // Still have to make sure the deletes happen before the adds
      const deletePath = Object.keys(args[0]).reduce((newPath, key) => newPath.delete({ [key]: [] }), path);

      return deletePath.add(...args);
    };
  }
}
