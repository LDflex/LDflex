import { ContextParser, Util as ContextUtil } from 'jsonld-context-parser';
import { namedNode } from '@rdfjs/data-model';
import { lazyThenable } from './promiseUtils';
import { valueToTerm } from './valueUtils';

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
   * When resolving a JSON-LD property,
   * we create a new chainable path segment corresponding to the predicate.
   *
   * Example usage: person.friends.firstName
   */
  resolve(property, pathData) {
    const predicate = lazyThenable(() => this.expandProperty(property));
    const reverse = lazyThenable(() => this._context.then(({ contextRaw }) =>
      contextRaw[property] && contextRaw[property]['@reverse']));
    const resultsCache = this.getResultsCache(pathData, predicate, reverse);
    const newData = { property, predicate, resultsCache, reverse, apply: this.apply };
    return pathData.extendPath(newData);
  }

  /**
   * When the property is called as a function,
   * it adds property-object constraints to the path.
   *
   * Example usage: person.friends.location(place).firstName
   */
  apply(args, pathData, path) {
    if (args.length === 0) {
      const { property } = pathData;
      throw new Error(`Specify at least one term when calling .${property}() on a path`);
    }
    // With the property constraint added, continue from the previous path
    pathData.values = args.map(valueToTerm);
    return path;
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
    const expandedProperty = context.expandTerm(property, true);
    if (!ContextUtil.isValidIri(expandedProperty))
      throw new Error(`The JSON-LD context cannot expand the '${property}' property`);
    return namedNode(expandedProperty);
  }

  /**
   * Extends the current JSON-LD context with the given context(s).
   */
  async extendContext(...contexts) {
    await (this._context = this._context.then(({ contextRaw }) =>
      new ContextParser().parse([contextRaw, ...contexts])));
  }

  /**
   * Gets the results cache for the given predicate.
   */
  getResultsCache(pathData, predicate, reverse) {
    let { propertyCache } = pathData;
    return propertyCache && lazyThenable(async () => {
      // Preloading does not work with reversed predicates
      propertyCache = !(await reverse) && await propertyCache;
      return propertyCache && propertyCache[(await predicate).value];
    });
  }
}
