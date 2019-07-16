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

    let queryVar = '?subject';
    let clauses = [];
    // Embed the basic graph pattern into a SPARQL query
    if (pathExpression.length > 1) {
      queryVar = this.createVar(pathData.property);
      const expressions = this.expressionToTriplePatterns(pathExpression, queryVar);
      clauses = `\n  ${expressions.join('\n  ')}`;
    }

    const select = `SELECT ${pathData.distinct ? 'DISTINCT ' : ''}${pathData.select ? pathData.select : queryVar}`;
    const where = `WHERE {${clauses}${pathData.finalClause ? pathData.finalClause(queryVar) : ''}\n}`;
    return `${select} ${where}`;
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
      where = this.expressionToTriplePatterns(conditions, subject, scope);
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

  expressionToTriplePatterns([root, ...pathExpression], queryVar, scope = {}) {
    const last = pathExpression.length - 1;
    let object = this.termToString(root.subject);
    return pathExpression.map((segment, index) => {
      // Obtain components and generate triple pattern
      const subject = object;
      const { predicate } = segment;
      object = index < last ? this.createVar(`v${index}`, scope) : queryVar;
      return `${subject} ${this.termToString(predicate)} ${object}.`;
    });
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
