import ContextProvider from './ContextProvider';
import { lazyThenable } from './promiseUtils';
import { valueToTerm } from './valueUtils';
import type { MaybePromise, PathData, Resolver } from './types'
import { IExpandOptions, JsonLdContext } from 'jsonld-context-parser'
import * as RDF from '@rdfjs/types';
import { Parser } from 'sparqljs';
const parser = new Parser()

parser.parse

/**
 * Resolves property names of a path
 * to their corresponding IRIs through a JSON-LD context.
 * @abstract
 */
export default abstract class AbstractPathResolver implements Resolver {
  private _contextProvider = new ContextProvider();

  expandTerm(term: string, expandVocab?: boolean, options?: IExpandOptions) {
    return this._contextProvider.expandTerm(term, expandVocab, options);
  }

  getContextRaw() {
    return this._contextProvider.getContextRaw();
  }

  extendContext(...contexts: JsonLdContext[]) {
    return this._contextProvider.extendContext(...contexts);
  }

  /**
   * Creates a new resolver for the given context(s).
   * @param arg Either a context provider *or* a context
   */
  constructor(arg: JsonLdContext | ContextProvider, ...contexts: JsonLdContext[]) {
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
  supports(property: any): boolean {
    return typeof property === 'string';
  }

  /**
   * When resolving a JSON-LD or complex path property,
   * we create a new chainable path segment corresponding to the predicate.
   *
   * Example usage: person.friends.firstName
   */
  resolve(property: string, pathData: PathData) {
    const predicate = lazyThenable(() => this.expandProperty(property));
    const reverse = lazyThenable(() => this.getContextRaw().then(context => context[property]?.['@reverse']))
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
  apply(args, pathData: PathData, path) {
    if (args.length === 0) {
      const { property } = pathData;
      throw new Error(`Specify at least one term when calling .${property}() on a path`);
    }
    // With the property constraint added, continue from the previous path
    pathData.values = args.map(valueToTerm);
    return path;
  }

  abstract lookupProperty(property: string): Promise<RDF.Term>;

  expandProperty(property: string): Promise<RDF.Term> {
    // JavaScript requires keys containing colons to be quoted,
    // so prefixed names would need to written as path['foaf:knows'].
    // We thus allow writing path.foaf_knows or path.foaf$knows instead.
    // TODO: Make sure this can be captured by the types system that we develop - or not
    return this.lookupProperty(property.replace(/^([a-z][a-z0-9]*)[_$]/i, '$1:'));
  }

  /**
   * Gets the results cache for the given predicate.
   * TODO: If anything results cache's should be per SPARQL algebra
   * rather than per predicate - furthermore this, in general, is better
   * handled by the query engine.
   */
  getResultsCache({ propertyCache }: PathData, predicate: MaybePromise<RDF.Term>, reverse: MaybePromise<boolean>) {
    return propertyCache && lazyThenable(async () => {
      // Preloading does not work with reversed predicates
      return !(await reverse) && (await propertyCache)?.[(await predicate).value];
    });
  }
}
