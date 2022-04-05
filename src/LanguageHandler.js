import { toIterablePromise } from './promiseUtils';

function _isWildCard(tag) {
  return tag === '*';
}

function _matchLangTag(left, right) {
  const matchInitial = new RegExp(`/${left}/`, 'iu');
  return matchInitial.test(`/${right}/`);
}

// TODO: Not an XPath function
// TODO: Publish as package
// https://www.ietf.org/rfc/rfc4647.txt
// https://www.w3.org/TR/sparql11-query/#func-langMatches
export function langMatches(tag, range) {
  const langTags = tag.split('-');
  const rangeTags = range.split('-');

  if (!_matchLangTag(rangeTags[0], langTags[0]) &&
    !_isWildCard(langTags[0]))
    return false;

  let lI = 1;
  let rI = 1;
  while (rI < rangeTags.length) {
    if (_isWildCard(rangeTags[rI])) {
      rI++;
      // eslint-disable-next-line no-continue
      continue;
    }
    if (lI === langTags.length)
      return false;
    if (_matchLangTag(rangeTags[rI], langTags[lI])) {
      lI++;
      rI++;
      // eslint-disable-next-line no-continue
      continue;
    }
    if (langTags[lI].length === 1)
      return false;
    lI++;
  }
  return true;
}

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
    pathData.skipDefaultLanguageFilter = true;
    for await (const item of path.results) {
      if (langMatches(await item.language, this.langCode))
        yield item;
    }
  }
}
