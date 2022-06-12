import { Handler } from "./types";

/**
 * Returns a new path starting from the predicate of the current path.
 *
 * Requires:
 * - (optional) a predicate property on the path data
 */
export default class PredicateHandler implements Handler {
  handle(pathData) {
    const { predicate } = pathData;
    return !predicate ? undefined : Promise.resolve(predicate)
      .then(subject => pathData.extendPath({ subject }, null));


    // TODO: See if we can make it this
    // const { predicate } = pathData;
    // if (!predicate) return undefined;
    // return pathData.extendPath({ subject: await predicate }, null);
  }
}
