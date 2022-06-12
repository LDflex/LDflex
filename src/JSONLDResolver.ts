import { Util as ContextUtil } from 'jsonld-context-parser';
import { namedNode } from '@rdfjs/data-model';
import AbstractPathResolver from './AbstractPathResolver';
import { Resolver } from './types';

/**
 * Resolves property names of a path
 * to their corresponding IRIs through a JSON-LD context.
 */
export default class JSONLDResolver extends AbstractPathResolver implements Resolver {
  /**
   * Expands a JSON property key into a full IRI.
   */
  async lookupProperty(property: string) {
    const expandedProperty = await this.expandTerm(property, true);
    if (expandedProperty === null || !ContextUtil.isValidIri(expandedProperty))
      throw new Error(`The JSON-LD context cannot expand the '${property}' property`);
    return namedNode(expandedProperty);
  }
}
