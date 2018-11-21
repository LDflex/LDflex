import assert from 'assert';
import { expand } from 'jsonld';

/**
 * Resolves property names of a path
 * to their corresponding IRIs through a JSON-LD context.
 */
export default class JSONLDResolver {
  constructor(context) {
    this._context = context;
  }

  /**
   * The JSON-LD resolver supports all string properties.
   */
  supports(property) {
    return typeof property === 'string';
  }

  /**
   * Resolves the property by extending the query path with it.
   */
  resolve(property, path) {
    const predicate = {
      then: (resolve, reject) =>
        this.expandProperty(property).then(resolve, reject),
    };
    return path.extend({ property, predicate });
  }

  /**
   * Expands a JSON property key into a full IRI.
   */
  async expandProperty(property) {
    // JavaScript requires keys containing colons to be quoted,
    // so prefixed names would need to written as path['foaf:knows'].
    // Allowing underscores lets us write path.foaf_knows.
    property = property.replace('_', ':');

    // Create a JSON-LD document with the given property
    const document = {
      '@context': this._context,
      [property]: '',
    };

    // Expand the document to obtain the full IRI
    const expanded = await expand(document);
    if (expanded.length === 0)
      throw new Error(`The JSON-LD context cannot expand the '${property}' property`);
    assert.equal(expanded.length, 1);
    const propertyIRIs = Object.keys(expanded[0]);
    assert.equal(propertyIRIs.length, 1);
    return propertyIRIs[0];
  }
}
