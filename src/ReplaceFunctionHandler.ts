import { Handler, PathData } from "./types";

/**
 * Returns a function that deletes the given value
 * for the path, and then adds the given values to the path.
 *
 * Requires:
 * - a delete function on the path proxy.
 * - an add function on the path proxy.
 */
export default class ReplaceFunctionHandler implements Handler {
  handle(pathData: PathData, path) {
    return function (oldValue, ...newValues) {
      if (!oldValue || !newValues.length)
        throw new Error('Replacing values requires at least two arguments, old value followed by all new values');
      return path.delete(oldValue).add(...newValues);
    };
  }
}

// TODO: Implement the concept of a "dependent" set of handlers.
// in the case of this handler this means that the 'ADD' and 'DELETE'
// handlers would be the dependent handlers
