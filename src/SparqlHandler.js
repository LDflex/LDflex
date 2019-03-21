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
    if (pathExpression.length < 2)
      throw new Error(`${pathData} should at least contain a subject and a predicate`);

    // Embed the basic graph pattern into a SPARQL query
    const queryVar = this.createVar(pathData.property);
    const clauses = this.expressionToTriplePatterns(pathExpression, queryVar);
    return `SELECT ${queryVar} WHERE {\n  ${clauses.join('\n  ')}\n}`;
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
  createVar(suggestion, scope) {
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
    switch (term.termType) {
    case 'NamedNode':
      return `<${term.value}>`;
    case 'BlankNode':
      return `_:${term.value}`;
    case 'Literal':
      let suffix = '';
      if (term.language)
        suffix = `@${term.language}`;
      else if (term.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string')
        suffix = `^^<${term.datatype.value}>`;
      return `"${term.value.replace(/"/g, '\\"')}"${suffix}`;
    default:
      throw new Error(`Could not convert a term of type ${term.termType}`);
    }
  }
}
