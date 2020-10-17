/**
 * Resolves property names of a path
 * to their corresponding IRIs through a JSON-LD context.
 */
export default class LanguageResolver {
  /**
   * The JSON-LD resolver supports all string properties.
   */
  supports(property) {
    return typeof property === 'string' && ['@', '$'].includes(property[0]);
  }

  /**
   * When resolving a JSON-LD property,
   * we create a new chainable path segment corresponding to the predicate.
   *
   * Example usage: tomato.label['@nl']
   * Example usage: tomato.label.@nl
   */
  async resolve(property, pathData) {
    const values = pathData.parent.proxy[pathData.property];
    for await (const path of values) {
      if (path.language === property.substr(1))
        return path;
    }

    return undefined;
  }
}
