import { namedNode } from '@rdfjs/data-model';

const NEEDS_ESCAPE = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
      ESCAPE_ALL = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
      ESCAPED_CHARS = {
        '\\': '\\\\', '"': '\\"', '\t': '\\t',
        '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f',
      };

/**
 * Expresses a path or mutation as a SPARQL query.
 *
 * Requires:
 * - a mutationExpressions or pathExpression property on the path proxy
 */
export default class SparqlHandler {
  async handle(pathData, path) {
    // First check if we have a mutation expression
    const mutationExpressions = await path.mutationExpressions;
    if (Array.isArray(mutationExpressions) && mutationExpressions.length)
      return mutationExpressions.map(e => this.mutationExpressionToQuery(e)).join('\n;\n');

    // Otherwise, fall back to checking for a path expression
    const pathExpression = await path.pathExpression;
    if (!Array.isArray(pathExpression))
      throw new Error(`${pathData} has no pathExpression property`);
    return this.pathExpressionToQuery(pathData, path, pathExpression);
  }

  pathExpressionToQuery(pathData, path, pathExpression) {
    if (pathExpression.length < 2 && !pathData.finalClause)
      throw new Error(`${pathData} should at least contain a subject and a predicate`);

    // Create triple patterns
    let queryVar = '?subject', sorts = [], clauses = [];
    if (pathExpression.length > 1) {
      queryVar = this.createVar(pathData.property);
      ({ queryVar, sorts, clauses } = this.expressionToTriplePatterns(pathExpression, queryVar));
    }
    if (pathData.finalClause)
      clauses.push(pathData.finalClause(queryVar));

    // Create SPARQL query body
    const distinct = pathData.distinct ? 'DISTINCT ' : '';
    const select = `SELECT ${distinct}${pathData.select ? pathData.select : queryVar}`;
    const where = ` WHERE {\n  ${clauses.join('\n  ')}\n}`;
    const orderClauses = sorts.map(({ order, variable }) => `${order}(${variable})`);
    const orderBy = orderClauses.length === 0 ? '' : `\nORDER BY ${orderClauses.join(' ')}`;
    return `${select}${where}${orderBy}`;
  }

  mutationExpressionToQuery({ mutationType, conditions, predicate, objects }) {
    // If the only condition is a subject, we need no WHERE clause
    const scope = {};
    let subject, where;
    if (conditions.length === 1) {
      subject = this.termToString(conditions[0].subject);
      where = [];
    }
    // Otherwise, create a WHERE clause from all conditions
    else {
      const lastPredicate = conditions[conditions.length - 1].predicate;
      subject = this.createVar(lastPredicate.value, scope);
      ({ queryVar: subject, clauses: where } = this.expressionToTriplePatterns(conditions, subject, scope));
    }

    // If a list of objects was specified, the mutation is "<s> <p> objects"
    const objectList = objects && objects.map(o => this.termToString(o)).join(', ');
    const mutationPattern = objectList ?
      `${subject} ${this.termToString(predicate)} ${objectList}.` :
      // Otherwise, the mutation is the unconstrained last segment
      where[where.length - 1];

    return where.length === 0 ?
      // If there are no WHERE clauses, just mutate raw data
      `${mutationType} DATA {\n  ${mutationPattern}\n}` :
      // Otherwise, return a DELETE/INSERT ... WHERE ... query
      `${mutationType} {\n  ${mutationPattern}\n} WHERE {\n  ${where.join('\n  ')}\n}`;
  }

  expressionToTriplePatterns([root, ...pathExpression], lastVar, scope = {}) {
    const lastIndex = pathExpression.length - 1;
    let object = this.termToString(skolemize(root.subject));
    let queryVar = object;
    const sorts = [];
    const clauses = pathExpression.map((segment, index) => {
      // Obtain components and generate triple pattern
      const subject = object;
      const { predicate } = segment;
      object = index < lastIndex ? this.createVar(`v${index}`, scope) : lastVar;
      const result = `${subject} ${this.termToString(predicate)} ${object}.`;

      // If the sort option was not set, use this object as a query variable
      if (!segment.sort) {
        queryVar = object;
      }
      // If sort was set, use this object as a sorting variable
      else {
        // TODO: handle when an object is used for sorting, and later also for querying
        sorts.push({ variable: object, order: segment.sort });
        // TODO: use a descriptive lastVar in case of sorting
        object = queryVar;
      }
      return result;
    });
    return { queryVar, sorts, clauses };
  }

  // Creates a unique query variable within the given scope, based on the suggestion
  createVar(suggestion = '', scope) {
    let counter = 0;
    let label = `?${suggestion.match(/[a-z0-9]*$/i)[0] || 'result'}`;
    if (scope) {
      while (scope[label])
        label = `?${suggestion}_${counter++}`;
      scope[label] = true;
    }
    return label;
  }

  // Converts an RDFJS term to a string that we can use in a query
  termToString(term) {
    // Determine escaped value
    let { value } = term;
    if (NEEDS_ESCAPE.test(value))
      value = value.replace(ESCAPE_ALL, escapeCharacter);

    switch (term.termType) {
    case 'NamedNode':
      return `<${value}>`;

    case 'BlankNode':
      return `_:${value}`;

    case 'Literal':
      // Determine optional language or datatype
      let suffix = '';
      if (term.language)
        suffix = `@${term.language}`;
      else if (term.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string')
        suffix = `^^<${term.datatype.value}>`;
      return `"${value}"${suffix}`;

    default:
      throw new Error(`Could not convert a term of type ${term.termType}`);
    }
  }
}

// Replaces a character by its escaped version
// (borrowed from https://www.npmjs.com/package/n3)
function escapeCharacter(character) {
  // Replace a single character by its escaped version
  let result = ESCAPED_CHARS[character];
  if (result === undefined) {
    // Replace a single character with its 4-bit unicode escape sequence
    if (character.length === 1) {
      result = character.charCodeAt(0).toString(16);
      result = '\\u0000'.substr(0, 6 - result.length) + result;
    }
    // Replace a surrogate pair with its 8-bit unicode escape sequence
    else {
      result = ((character.charCodeAt(0) - 0xD800) * 0x400 +
                 character.charCodeAt(1) + 0x2400).toString(16);
      result = '\\U00000000'.substr(0, 10 - result.length) + result;
    }
  }
  return result;
}

// Skolemizes the given term if it is a blank node
let skolemId = 0;
function skolemize(term) {
  if (term.termType !== 'BlankNode')
    return term;
  if (!term.skolemized)
    term.skolemized = namedNode(`urn:ldflex:sk${skolemId++}`);
  return term.skolemized;
}
