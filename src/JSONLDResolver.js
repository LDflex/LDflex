import assert from 'assert';
import { expand } from 'jsonld';

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
  resolve(queryPath, property) {
    const pathExpression = {
      then: (resolve, reject) =>
        this.expandProperty(property).then(resolve, reject),
    };
    return queryPath.extend({ pathExpression });
  }

  /**
   * Expands a JSON property key into a full IRI.
   */
  async expandProperty(property) {
    // Create a JSON-LD document with the given property
    const document = {
      '@context': this._context,
      [property]: '',
    };

    // Expand the document to obtain the full IRI
    const expanded = await expand(document);
    if (expanded.length === 0)
      throw new Error(`Property '${property}' could not be expanded from the context`);
    assert.equal(expanded.length, 1);
    const propertyIRIs = Object.keys(expanded[0]);
    assert.equal(propertyIRIs.length, 1);
    return propertyIRIs[0];
  }
}
