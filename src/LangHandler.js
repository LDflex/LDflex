/**
 * Sets a language filter and returns the previous path.
 */
export default class LangHandler {
  handle(pathData, path) {
    return (...languageRanges) => {
      pathData.languageRanges = languageRanges;
      return path;
    };
  }
}

