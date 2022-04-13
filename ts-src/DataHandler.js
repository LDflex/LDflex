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


  // Resolves the data path, or returns a function that does so
  handle(pathData) {
    return !this._isFunction ?
      this._resolveDataPath(pathData) :
      () => this._resolveDataPath(pathData);
  }

  // Resolves the data path
  _resolveDataPath(data) {
    return !this._isAsync ?
      this._resolveSyncDataPath(data) :
      this._resolveAsyncDataPath(data);
  }

  // Resolves synchronous property access
  _resolveSyncDataPath(data) {
    for (const property of this._dataProperties)
      data = data && data[property];
    return data;
  }

  // Resolves asynchronous property access
  async _resolveAsyncDataPath(data) {
    for (const property of this._dataProperties)
      data = data && await data[property];
    return data;
  }
}
