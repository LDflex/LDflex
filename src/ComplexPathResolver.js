import { translate, toSparql } from 'sparqlalgebrajs';
import AbstractPathResolver from './AbstractPathResolver';
import { namedNode } from '@rdfjs/data-model';

/**
 * Writes SPARQL algebra a complex SPARQL path
 */
function writePathAlgebra(algebra) {
  if (algebra.type === 'join')
    return `${writePathAlgebra(algebra.left)}/${writePathAlgebra(algebra.right)}`;
  // The algebra library turns sequential path expressions like
  // foaf:friend/foaf:givenName into a bgp token rather than a path token
  if (algebra.type === 'bgp' &&
      algebra.patterns.every(quad => quad.predicate.termType === 'NamedNode') &&
      algebra.patterns.length >= 0)
    return algebra.patterns.map(quad => `<${quad.predicate.value}>`).join('/');
  if (algebra.type === 'path') {
    // Note - this could be made cleaner if sparqlalgebrajs exported
    // the translatePathComponent function
    let query = toSparql({ type: 'project', input: algebra });
    query = query.replace(/^SELECT WHERE \{ \?[0-9a-z]+ \(|\) \?[0-9a-z]+\. \}$/ig, '');
    return query;
  }
  throw new Error(`Unhandled algebra ${algebra.type}`);
}

export default class ComplexPathResolver extends AbstractPathResolver {
  /**
   * Supports all strings that contain path modifiers. The regular
   * expression is testing for 4 main properties:
   * 1. /(^|[/|])[\^]/
   *    Tests for reverse (^) key at start of string or after '/', '|'
   * 2. /([a-z:>)])[\*\+\?]/i
   *    Tests for length modifier
   *    e.g. ex:test*, <http://example.org/test>?, (ex:test)+
   * 3. /([)>\*\+\?]|[a-z]*[:][a-z]*)[|/]([<(\^]|[a-z]*[:][a-z]*)/i
   *    Tests for '/' and '|' operators *in* a path
   * 4. /((^[(<])|([)>]$))/
   *    Tests for '(', '<', at the start of a string and ')', '>' at the end of a string
   */
  supports(property) {
    return super.supports(property) &&
      (/((^|[/|])[\^])|(([a-z:>)])[*+?])|([)>*+?]|[a-z]*[:][a-z]*)[|/]([<(^]|[a-z]*[:][a-z]*)|(((^[(<])|([)>]$)))/i)
        .test(property);
  }

  /**
   * Takes string and resolves it to a predicate or SPARQL path
   */
  async lookupProperty(property) {
    // Expand the property to a full IRI
    const context = await this._context;
    const prefixes = {};
    for (const key in context.contextRaw) {
      if (typeof context.contextRaw[key] === 'string')
        prefixes[key] = context.contextRaw[key];
    }
    // Wrap inside try/catch as 'translate' throws error on invalid paths
    let algebra;
    try {
      algebra = translate(`SELECT ?s ?o WHERE { ?s ${property} ?o. }`, {
        prefixes,
      });
    }
    catch (e) {
      throw new Error(`The Complex Path Resolver cannot expand the '${property}' path`);
    }

    if (algebra.input.type === 'bgp' &&
      algebra.input.patterns.length === 1 &&
      algebra.input.patterns[0].predicate.termType === 'NamedNode')
      return namedNode(algebra.input.patterns[0].predicate.value);

    try {
      return {
        termType: 'path',
        value: writePathAlgebra(algebra.input),
      };
    }
    catch (e) {
      throw new Error(`The Complex Path Resolver cannot expand the '${property}' path`);
    }
  }
}

