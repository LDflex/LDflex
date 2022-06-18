import { Handler } from "./types";

interface Options {
  async?: boolean;
  function?: boolean;
}

/**
 * Resolves to the given item in the path data.
 * For example, new DataHandler({}, 'foo', 'bar')
 * will return pathData.foo.bar.
 *
 * Resolution can optionally be async,
 * and/or be behind a function call.
 */
export default class DataHandler implements Handler {
  private _isAsync: boolean;
  private _isFunction: boolean;
  private _dataProperties: string[]

  constructor(options: Options, ...dataProperties: string[]) {
    this._isAsync = Boolean(options.async);
    this._isFunction = Boolean(options.function);
    this._dataProperties = dataProperties;
  }

  static sync(...dataProperties: string[]) {
    return new DataHandler({ async: false }, ...dataProperties);
  }

  static syncFunction(...dataProperties: string[]) {
    return new DataHandler({ async: false, function: true }, ...dataProperties);
  }

  static async(...dataProperties: string[]) {
    return new DataHandler({ async: true }, ...dataProperties);
  }

  static asyncFunction(...dataProperties: string[]) {
    return new DataHandler({ async: true, function: true }, ...dataProperties);
  }


  // Resolves the data path, or returns a function that does so
  handle(pathData) {
    return this._isFunction ?
      () => this._resolveDataPath(pathData) :
      this._resolveDataPath(pathData);
  }

  // Resolves the data path
  _resolveDataPath(data) {
    return !this._isAsync ?
      this._resolveSyncDataPath(data) :
      this._resolveAsyncDataPath(data);
  }

  // Resolves synchronous property access
  _resolveSyncDataPath(data) {
    return this._dataProperties.reduce(prop => data?.[prop])
    for (const property of this._dataProperties)
      data &&= data[property];
    return data;
  }

  // Resolves asynchronous property access
  async _resolveAsyncDataPath(data) {
    for (const property of this._dataProperties)
      data &&= await data[property];
    return data;
  }
}
