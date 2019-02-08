import { ContextParser } from 'jsonld-context-parser';
import { namedNode } from '@rdfjs/data-model';
import { getThen } from './promiseUtils';

/**
 * Resolves property names of a path
 * to their corresponding IRIs through a JSON-LD context.
 */
export default class JSONLDResolver {
  constructor(context) {
    this._context = new ContextParser().parse(context);
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

    // Expand the property to a full IRI
    const expandedProperty = ContextParser.expandTerm(property, await this._context, true);
    if (!ContextParser.isValidIri(expandedProperty))
      throw new Error(`The JSON-LD context cannot expand the '${property}' property`);
    return namedNode(expandedProperty);
  }
}
