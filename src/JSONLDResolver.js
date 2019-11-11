import { ContextParser } from 'jsonld-context-parser';
import { namedNode } from '@rdfjs/data-model';
import { lazyThenable } from './promiseUtils';

/**
 * Resolves property names of a path
 * to their corresponding IRIs through a JSON-LD context.
 */
export default class JSONLDResolver {
  _context = Promise.resolve({});

  /**
   * Creates a new resolver for the given context(s).
   */
  constructor(...contexts) {
    this.extendContext(...contexts);
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
    const predicate = lazyThenable(() => this.expandProperty(property));
    const resultsCache = this.getResultsCache(pathData, predicate);
    return pathData.extendPath({ property, predicate, resultsCache });
  }

  /**
   * Expands a JSON property key into a full IRI.
   */
  async expandProperty(property) {
    // JavaScript requires keys containing colons to be quoted,
    // so prefixed names would need to written as path['foaf:knows'].
    // We thus allow writing path.foaf_knows or path.foaf$knows instead.
    property = property.replace(/^([a-z][a-z0-9]*)[_$]/i, '$1:');

    // Expand the property to a full IRI
    const context = await this._context;
    const expandedProperty = ContextParser.expandTerm(property, context, true);
    if (!ContextParser.isValidIri(expandedProperty))
      throw new Error(`The JSON-LD context cannot expand the '${property}' property`);
    return namedNode(expandedProperty);
  }

  /**
   * Extends the current JSON-LD context with the given context(s).
   */
  async extendContext(...contexts) {
    await (this._context = this._context.then(currentContext =>
      new ContextParser().parse([currentContext, ...contexts])));
  }

  /**
   * Gets the results cache for the given predicate.
   */
  getResultsCache(pathData, predicate) {
    let { propertyCache } = pathData;
    return propertyCache && lazyThenable(async () => {
      propertyCache = await propertyCache;
      return propertyCache && propertyCache[(await predicate).value];
    });
  }
}
