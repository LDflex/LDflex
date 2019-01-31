/**
 * Resolves to the given item in the path data.
 *
 * This resolution can optionally be async,
 * and/or be behind a function call.
 */
export default class DataHandler {
  constructor(options, ...pathSegments) {
    this._async = options.async;
    this._function = options.function;
    this._pathSegments = pathSegments;
  }

  static sync(...pathSegments) {
    return new DataHandler({ async: false }, ...pathSegments);
  }

  static syncFunction(...pathSegments) {
    return new DataHandler({ async: false, function: true }, ...pathSegments);
  }

  static async(...pathSegments) {
    return new DataHandler({ async: true }, ...pathSegments);
  }

  static asyncFunction(...pathSegments) {
    return new DataHandler({ async: true, function: true }, ...pathSegments);
  }

  /**
   * Resolve the data path.
   */
  handle(pathData) {
    return !this._function ?
      this._resolveDataPath(pathData) :
      () => this._resolveDataPath(pathData);
  }

  _resolveDataPath(data) {
    // Resolve synchronous property access
    if (!this._async) {
      for (const pathSegment of this._pathSegments)
        data = data && data[pathSegment];
      return data;
    }

    // Resolve asynchronous property access
    return new Promise(async resolve => {
      for (const pathSegment of this._pathSegments)
        data = data && await data[pathSegment];
      resolve(data);
    });
  }
}
