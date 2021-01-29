import ContextProvider from './ContextProvider';
import { lazyThenable } from './promiseUtils';
import { valueToTerm } from './valueUtils';

/**
 * Resolves property names of a path
 * to their corresponding IRIs through a JSON-LD context.
 * @abstract
 */
export default class AbstractPathResolver {
  _contextProvider = new ContextProvider();

  get _context() {
    return this._contextProvider._context;
  }

  async extendContext(...contexts) {
    await this._contextProvider.extendContext(...contexts);
  }

  /**
   * Creates a new resolver for the given context(s).
   * @param arg Either a context provider *or* a context
   */
  constructor(arg, ...contexts) {
    if (arg instanceof ContextProvider) {
      this._contextProvider = arg;
      this.extendContext(...contexts);
    }
    else {
      this.extendContext(arg, ...contexts);
    }
  }

  /**
   * The JSON-LD resolver supports all string properties.
   */
  supports(property) {
    return typeof property === 'string';
  }

  /**
   * When resolving a JSON-LD or complex path property,
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

  async expandProperty(property) {
    // JavaScript requires keys containing colons to be quoted,
    // so prefixed names would need to written as path['foaf:knows'].
    // We thus allow writing path.foaf_knows or path.foaf$knows instead.
    return this.lookupProperty(property.replace(/^([a-z][a-z0-9]*)[_$]/i, '$1:'));
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
