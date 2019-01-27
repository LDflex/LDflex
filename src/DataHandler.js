/**
 * Resolves to the given property path segments inside the path object.
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
   * Resolve the path.
   */
  execute(path) {
    return this._function ? () => this._handlePath(path) : this._handlePath(path);
  }

  _handlePath(path) {
    if (this._async) {
      return new Promise(async resolve => {
        for (const pathSegment of this._pathSegments)
          path = path && await path[pathSegment];
        return resolve(path);
      });
    }

    for (const pathSegment of this._pathSegments)
      path = path && path[pathSegment];
    return path;
  }
}
