import { Util as ContextUtil } from 'jsonld-context-parser';
import { namedNode } from '@rdfjs/data-model';
import AbstractPathResolver from './AbstractPathResolver';

/**
 * Resolves property names of a path
 * to their corresponding IRIs through a JSON-LD context.
 */
export default class JSONLDResolver extends AbstractPathResolver {
  /**
   * Expands a JSON property key into a full IRI.
   */
  async lookupProperty(property) {
    const context = await this._context;
    const expandedProperty = context.expandTerm(property, true);
    if (!ContextUtil.isValidIri(expandedProperty))
      throw new Error(`The JSON-LD context cannot expand the '${property}' property`);
    return namedNode(expandedProperty);
  }
}
