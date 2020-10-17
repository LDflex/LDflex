/**
 * Resolves property names of a path
 * to their corresponding IRIs through a JSON-LD context.
 */
export default class LanguageResolver {
  /**
   * The JSON-LD resolver supports all string properties.
   */
  supports(property) {
    return typeof property === 'string' && ['en', 'nl', 'de', 'fr'].includes(property);
  }

  /**
   * When resolving a JSON-LD property,
   * we create a new chainable path segment corresponding to the predicate.
   *
   * Example usage: tomato.label.nl
   */
  resolve(property, pathData) {
    return pathData.extendPath({ languageFilter: property });
  }
}
