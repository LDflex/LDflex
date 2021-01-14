import { translate, toSparql } from 'sparqlalgebrajs';
import { lazyThenable } from './promiseUtils';
import { ContextParser } from 'jsonld-context-parser';

export default class ComplexPathResolver {
  _context = Promise.resolve({});

  /**
   * Creates a new resolver for the given context(s).
   */
  constructor(PropertyResolver, ...contexts) {
    this.extendContext(...contexts);
    this._propertyResolver = new PropertyResolver(...contexts);
    this.apply = this._propertyResolver.apply;
  }

  /**
   * The Complex Path resolver supports all string properties.
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
   * Takes string and resolves it to a predicate or
   * sparql path
   */
  async expandProperty(property) {
    try {
      return await this._propertyResolver.expandProperty(property);
    }
    // eslint-disable-next-line no-empty
    catch (e) {}

    // JavaScript requires keys containing colons to be quoted,
    // so prefixed names would need to written as path['foaf:knows'].
    // We thus allow writing path.foaf_knows or path.foaf$knows instead.
    property = property.replace(/^([a-z][a-z0-9]*)[_$]/i, '$1:');

    // Expand the property to a full IRI
    const context = await this._context;

    let algebra;
    const prefixes = {};
    for (const key in context.contextRaw) {
      if (typeof context.contextRaw[key] === 'string' &&
      // Test to make sure IRI is absolute
      (/[a-z]+:/i).test(context.contextRaw[key]) &&
      // Test to make sure the prefix is not referring to another
      // part of the JSON-LD context
      !((/^[a-z]+/i).exec(context.contextRaw[key])?.[0] in context.contextRaw)
      )
        prefixes[key] = context.contextRaw[key];
    }
    // Wrap inside try/catch as 'translate' throws error on invalid paths
    try {
      algebra = translate(`SELECT ?s ?o WHERE { ?s ${property} ?o. }`, {
        prefixes,
      });
    }
    catch (e) {
      throw new Error(`The Complex Path Resolver cannot expand the '${property}' path`);
    }

    if (algebra.input.type === 'path') {
      // Note - this could be made cleaner if sparqlalgebrajs exported
      // the translatePathComponent function
      let query = toSparql(algebra);
      query = query.replace(/^SELECT \?s \?o WHERE \{ \?s \(|\) \?o\. \}$/g, '');
      return query;
    }
    // The algebra library turns sequential path expressions like
    // foaf:friend/foaf:givenName into a bgp token rather than a path token
    if (algebra.input.type === 'bgp' &&
      algebra.input.patterns.every(quad => quad.predicate.termType === 'NamedNode'))
      return algebra.input.patterns.map(quad => `<${quad.predicate.value}>`).join('/');

    throw new Error(`The Complex Path Resolver cannot expand the '${property}' path`);
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

  /**
   * Extends the current context with the given context(s).
   */
  async extendContext(...contexts) {
    await (this._context = this._context.then(({ contextRaw }) =>
      new ContextParser().parse([contextRaw, ...contexts])));
    await this._propertyResolver.extendContext(...contexts);
  }
}
