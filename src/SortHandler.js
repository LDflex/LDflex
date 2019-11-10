/**
 * Returns a function that creates a new path with the same values,
 * but sorted on the given predicate.
 * The function accepts multiple parameters to sort on a deeper path.
 */
export default class SortHandler {
  constructor(order = 'ASC') {
    this.order = order;
  }

  handle(pathData) {
    return (...properties) => {
      if (pathData.sort)
        throw new Error('Multiple sorts on a path are not yet supported');
      const childData = { childLimit: properties.length, sort: this.order };
      const sortPath = pathData.extendPath({ childData });
      return properties.reduce((path, property) => path[property], sortPath);
    };
  }
}
