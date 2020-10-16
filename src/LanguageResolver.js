/**
 * Returns a new path starting from the predicate of the current path.
 *
 * Requires:
 * - (optional) a predicate property on the path data
 */
export default class LanguageResolver {
  supports(property) {
    return typeof property === 'string' && ['en', 'nl'].includes(property);
  }

  /**
   * When resolving a JSON-LD property,
   * we create a new chainable path segment corresponding to the predicate.
   *
   * Example usage: tomato.label.en
   */
  resolve(property, pathData) {
    return pathData.extendPath({
      languageFilter: property,
    });
  }
}
