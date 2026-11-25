/**
 * Sets a language filter and returns the previous path.
 */
export default class LangHandler {
  handle(pathData) {
    return (...languageRanges) => {
      const newPathData = { ...pathData, languageRanges };
      return pathData.extendPath(newPathData, pathData.parent ?? pathData);
    };
  }
}

