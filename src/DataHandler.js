/**
 * Resolves to the given item in the path data.
 * For example, new DataHandler({}, 'foo', 'bar')
 * will return pathData.foo.bar.
 *
 * Resolution can optionally be async,
 * and/or be behind a function call.
 */
export default class DataHandler {
  constructor(options, ...dataProperties) {
    this._isAsync = options.async;
    this._isFunction = options.function;
    this._dataProperties = dataProperties;
  }

  static sync(...dataProperties) {
    return new DataHandler({ async: false }, ...dataProperties);
  }

  static syncFunction(...dataProperties) {
    return new DataHandler({ async: false, function: true }, ...dataProperties);
  }

  static async(...dataProperties) {
    return new DataHandler({ async: true }, ...dataProperties);
  }

  static asyncFunction(...dataProperties) {
    return new DataHandler({ async: true, function: true }, ...dataProperties);
  }

  /**
   * Resolve the data path.
   */
  handle(pathData) {
    return !this._isFunction ?
      this._resolveDataPath(pathData) :
      () => this._resolveDataPath(pathData);
  }

  _resolveDataPath(data) {
    // Resolve synchronous property access
    if (!this._isAsync) {
      for (const property of this._dataProperties)
        data = data && data[property];
      return data;
    }

    // Resolve asynchronous property access
    return new Promise(async resolve => {
      for (const property of this._dataProperties)
        data = data && await data[property];
      resolve(data);
    });
  }
}
