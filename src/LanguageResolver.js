import JSONLDResolver from './JSONLDResolver';

const isBCP47 = new RegExp(/^((?<grandfathered>(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((?<language>([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-(?<script>[A-Za-z]{4}))?(-(?<region>[A-Za-z]{2}|[0-9]{3}))?(-(?<variant>[A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-(?<extension>[0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(?<privateUse>x(-[A-Za-z0-9]{1,8})+))?)|(?<privateUse1>x(-[A-Za-z0-9]{1,8})+))$/);

/**
 * Returns a new path starting from the predicate of the current path.
 *
 * Requires:
 * - (optional) a predicate property on the path data
 */
export default class LanguageResolver extends JSONLDResolver {
  supports(property) {
    return typeof property === 'string' && property.startsWith('@') && isBCP47.test(property.substring(1));
  }

  /**
   * When resolving a JSON-LD property,
   * we create a new chainable path segment corresponding to the language.
   *
   * Example usage: tomato.label['@en']
   */
  resolve(property, pathData) {
    return pathData.extendPath({ finalClause: queryVar => `FILTER( langMatches(${queryVar}, "${property.substring(1)}") )` });
  }
}
