/**
 * Resolves a specific language of a path
 */
export default class LanguageResolver {
  /**
   * The language may be prefixed @ or $.
   */
  supports(property) {
    return typeof property === 'string' && ['@', '$'].includes(property[0]);
  }

  /**
   * We fetch all the translations and return the selected one.
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
