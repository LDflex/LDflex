import { toIterablePromise } from './promiseUtils';

/**
 * Resolves to the given item in the path data.
 * For example, new DataHandler({}, 'foo', 'bar')
 * will return pathData.foo.bar.
 *
 * Resolution can optionally be async,
 * and/or be behind a function call.
 */
export default class LanguageHandler {
  constructor(langCode) {
    this.langCode = langCode;
  }

  // Resolves the data path, or returns a function that does so
  handle(pathData, path) {
    return toIterablePromise(this._handle(pathData, path));
  }

  async* _handle(pathData, path) {
    for await (const item of path.results) {
      if (await item.language === this.langCode)
        yield item;
    }
  }
}
