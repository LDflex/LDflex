/**
 * Returns a new path starting from the predicate of the current path.
 *
 * Requires:
 * - (optional) a predicate property on the path data
 */
export default class PredicateHandler {
  handle(pathData) {
    const { predicate } = pathData;
    return !predicate ? undefined : Promise.resolve(predicate)
      .then(subject => pathData.extendPath({ subject }, null));
  }
}
