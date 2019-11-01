/**
 * Returns a function that creates a new path with the same values as the previous one but sorted on the given predicate.
 * The function accepts multiple parameters to sort on a deeper path.
 */
export default class SortHandler {
  constructor(order = 'ASC') {
    this.order = order;
  }

  handle(pathData) {
    return (...args) => {
      if (pathData.sort)
        throw new Error('Multiple sorts not supported');
      const sortProxy = pathData.extendPath({ childData: { count: args.length, data: { sort: this.order } } });
      return args.reduce((acc, val) => acc[val], sortProxy);
    };
  }
}
