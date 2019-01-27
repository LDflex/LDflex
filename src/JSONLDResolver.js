import assert from 'assert';
import { expand } from 'jsonld';
import { namedNode } from '@rdfjs/data-model';
import { getThen } from './promiseUtils';

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
  resolve(property, pathData) {
    const predicate = { then: getThen(() => this.expandProperty(property)) };
    return pathData.extendPath({ property, predicate });
  }

  /**
   * Expands a JSON property key into a full IRI.
   */
  async expandProperty(property) {
    // JavaScript requires keys containing colons to be quoted,
    // so prefixed names would need to written as path['foaf:knows'].
    // We thus allow writing path.foaf_knows or path.foaf$knows instead.
    property = property.replace(/[_$]/, ':');

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
    return namedNode(propertyIRIs[0]);
  }
}
