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
      return this.evaluateMutationExpression(pathData, path, mutationExpressions);

    // Otherwise, fall back to checking for a path expression
    const pathExpression = await path.pathExpression;
    if (!Array.isArray(pathExpression))
      throw new Error(`${pathData} has no pathExpression property`);
    return this.evaluatePathExpression(pathData, path, pathExpression);
  }

  evaluatePathExpression(pathData, path, pathExpression) {
    // Require at least a subject and a link
    if (pathExpression.length < 2)
      throw new Error(`${pathData} should at least contain a subject and a predicate`);

    // Determine the query variable name
    const queryVar = pathData.property.match(/[a-z0-9]*$/i)[0] || 'result';

    // Embed the basic graph pattern into a SPARQL query
    const clauses = this.expressionToTriplePatterns(pathExpression, queryVar);
    return `SELECT ?${queryVar} WHERE {\n  ${clauses.join('\n  ')}\n}`;
  }

  evaluateMutationExpression(pathData, path, mutationExpressions) {
    return mutationExpressions.map(e => this.mutationExpressionToQuery(e)).join('\n;\n');
  }

  expressionToTriplePatterns([root, ...pathExpression], queryObject, scope = {}) {
    const last = pathExpression.length - 1;
    let object = this.termToQueryString(root.subject);
    return pathExpression.map((segment, index) => {
      // Obtain triple pattern components
      const subject = object;
      const { predicate } = segment;
      object = index !== last ? `?${this.getQueryVar(`v${index}`, scope)}` : `?${queryObject}`;
      // Generate triple pattern
      return `${subject} ${this.termToQueryString(predicate)} ${object}.`;
    });
  }

  mutationExpressionToQuery({ mutationType, conditions, predicate, objects }) {
    // Determine the patterns that should appear in the WHERE clause
    const scope = {};
    let mutationPattern;
    const [subject, clauses] = this.getSubjectAndClauses(conditions, scope);

    // If we have a range, the mutation is on <domainVar> <predicate> <rangeVar>
    if (objects) {
      const objectList = objects.map(o => this.termToQueryString(o)).join(', ');
      mutationPattern = `${subject} ${this.termToQueryString(predicate)} ${objectList}`;
    }
    // If we don't have a range, assume that the mutation is on the last segment of the domain
    else {
      mutationPattern = clauses[clauses.length - 1].slice(0, -1);
    }

    // If we don't have any WHERE clauses, we just insert raw data
    if (!clauses.length)
      return `${mutationType} DATA {\n  ${mutationPattern}\n}`;
    // Otherwise, return an INSERT ... WHERE ... query
    return `${mutationType} {\n  ${mutationPattern}\n} WHERE {\n  ${clauses.join('\n  ')}\n}`;
  }

  getSubjectAndClauses(expression, scope) {
    // If the expression has one segment, return its subject
    if (expression.length === 1) {
      const { subject } = expression[0];
      return [this.termToQueryString(subject), []];
    }

    // Otherwise, create triples patterns from it
    const lastPredicate = expression[expression.length - 1].predicate.value;
    const queryVar = this.getQueryVar(lastPredicate.match(/[a-z0-9]*$/i)[0] || 'result', scope);
    return [
      `?${queryVar}`,
      this.expressionToTriplePatterns(expression, queryVar, scope),
    ];
  }

  // Creates a unique query variable label within the given scope based on the given suggestion
  getQueryVar(labelSuggestion, scope) {
    let label = labelSuggestion;
    let counter = 0;
    while (scope[label])
      label = `${labelSuggestion}_${counter++}`;
    scope[label] = true;
    return label;
  }

  // Converts an RDFJS term to a string that we can use in a query
  termToQueryString(term) {
    switch (term.termType) {
    case 'NamedNode':
      return `<${term.value}>`;
    case 'BlankNode':
      return `_:${term.value}`;
    case 'Literal':
      return `"${term.value.replace(/"/g, '\\"')}"`;
    default:
      throw new Error(`Could not convert a term of type ${term.termType}`);
    }
  }
}
