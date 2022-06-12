import { translate, toSparql, Algebra, Factory } from 'sparqlalgebrajs';
import AbstractPathResolver from './AbstractPathResolver';
import { namedNode } from '@rdfjs/data-model';
import { IJsonLdContextNormalizedRaw } from 'jsonld-context-parser';
import { Resolver } from './types';
import * as RDF from '@rdfjs/types';
const factory = new Factory();

/**
 * Writes SPARQL algebra a complex SPARQL path
 */
function writePathAlgebra(algebra: Algebra.Join | Algebra.Bgp | Algebra.Operation): string {
  if (algebra.type === Algebra.types.JOIN)
    return algebra.input.map(x => writePathAlgebra(x)).join('/');
  // The algebra library turns sequential path expressions like
  // foaf:friend/foaf:givenName into a bgp token rather than a path token
  if (algebra.type === Algebra.types.BGP &&
      algebra.patterns.every(quad => quad.predicate.termType === 'NamedNode') &&
      algebra.patterns.length >= 0) {
    let lastObject = 's';
    return algebra.patterns.map(quad => {
      const predicate = `<${quad.predicate.value}>`;
      if (quad.object.value === lastObject) {
        lastObject = quad.subject.value;
        return `^${predicate}`;
      }
      lastObject = quad.object.value;
      return predicate;
    }).join('/');
  }
  if (algebra.type === Algebra.types.PATH) {
    // Note - this could be made cleaner if sparqlalgebrajs exported
    // the translatePathComponent function
    let query = toSparql(factory.createProject(algebra, []));
    query = query.replace(/^SELECT WHERE \{ \?[0-9a-z]+ \(|\) \?[0-9a-z]+\. \}$/ig, '');
    return query;
  }
  throw new Error(`Unhandled algebra ${algebra.type}`);
}

export default class ComplexPathResolver extends AbstractPathResolver implements Resolver {
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
  supports(property: any): boolean {
    return super.supports(property) &&
      (/((^|[/|])[\^])|(([a-z:>)])[*+?])|([)>*+?]|[a-z]*[:][a-z]*)[|/]([<(^]|[a-z]*[:][a-z]*)|(((^[(<])|([)>]$)))/i)
        .test(property);
  }

  /**
   * Takes string and resolves it to a predicate or SPARQL path
   */
  async lookupProperty(property: string): Promise<RDF.Term> {
    // Expand the property to a full IRI
    const context = await this.getContextRaw();
    const prefixes: Record<string, string> = {};
    for (const key in context) {
      if (typeof context[key] === 'string')
        prefixes[key] = context[key];
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

    if (algebra.input.type === Algebra.types.BGP &&
      algebra.input.patterns.length === 1 &&
      algebra.input.patterns[0].predicate.termType === 'NamedNode' &&
      // Test to make sure the path is not an inverse path
      // in which case the subject and object would be switched
      algebra.input.patterns[0].subject.value === 's')
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

