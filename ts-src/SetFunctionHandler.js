import MutationFunctionHandler from './MutationFunctionHandler';
import { hasPlainObjectArgs } from './valueUtils';

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
      // First, delete all existing values for the property/properties
      const deletePath = !hasPlainObjectArgs(args) ?
        // When a single property is given, delete all of its values
        path.delete() :
        // When a map of properties is given, delete all of their values
        Object.keys(args[0]).reduce((previousPath, property) =>
          previousPath.delete({ [property]: [] }), path);
      // Next, insert the new values
      return deletePath.add(...args);
    };
  }
}
