import { isPlainObject, isAsyncIterable } from './valueUtils';
import { iterableToArray } from './iterableUtils';

/**
 * Returns a function that requests the values of multiple properties.
 * You can use this function to access properties as follows:
 * - fn() returns []
 * - fn(p1) returns [path[p1]]
 * - fn(p1, p2) returns [path[p1], path[p2]]
 * - fn([p1, p2]) returns [path[p1], path[p2]]
 * - fn(asyncIterable) returns [path[p1], path[p2]]
 * - fn({ p1: null, p2: null }) returns { p1: path[p1], p2: path[p2] }
 * Combinations of the above are possible by passing them in arrays.
 */
export default class GetFunctionHandler {
  handle(pathData, path) {
    return (...args) => this.readProperties(path,
      args.length === 1 ? args[0] : args, true);
  }

  async readProperties(path, properties, wrapSingleValues = false) {
    // Convert an async iterable to an array
    if (isAsyncIterable(properties))
      properties = await iterableToArray(properties);

    // If passed an array, read every property
    if (Array.isArray(properties)) {
      const values = properties.map(p => this.readProperties(path, p));
      return Promise.all(values);
    }

    // If passed an object with property names as keys,
    // return an object with the values filled in
    if (isPlainObject(properties)) {
      // Use the key as property value if none is specified
      const keys = Object.keys(properties);
      properties = keys.map(key => properties[key] || key);
      // Store the resolved properties by key
      const results = {};
      const values = await this.readProperties(path, properties);
      for (let i = 0; i < keys.length; i++)
        results[keys[i]] = values[i];
      return results;
    }

    // Otherwise, perform a single property access
    const value = path[properties];
    return wrapSingleValues ? [value] : value;
  }
}
