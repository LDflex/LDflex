/**
 * Expresses a path or mutation as a SPARQL query.
 *
 * Requires:
 * - a mutationExpressions or pathExpression property on the path proxy
 */
export default class SparqlHandler {
  async execute(path, proxy) {
    // First check if we have a mutation expression
    const mutationExpressions = await proxy.mutationExpressions;
    if (Array.isArray(mutationExpressions) && mutationExpressions.length)
      return this.executeMutationExpression(path, proxy, mutationExpressions);

    // Otherwise, fallback to checking for a path expression
    const pathExpression = await proxy.pathExpression;
    if (!Array.isArray(pathExpression))
      throw new Error(`${path} has no pathExpression property`);
    return this.executePathExpression(path, proxy, pathExpression);
  }

  executePathExpression(path, proxy, pathExpression) {
    // Require at least a subject and a link
    if (pathExpression.length < 2)
      throw new Error(`${path} should at least contain a subject and a predicate`);

    // Determine the query variable name
    const queryVar = path.property.match(/[a-z0-9]*$/i)[0] || 'result';

    // Build basic graph pattern
    const clauses = this.expressionToTriplePatterns(pathExpression, queryVar);

    // Embed the basic graph pattern into a SPARQL query
    const joinedClauses = clauses.join('\n  ');
    return `SELECT ?${queryVar} WHERE {\n  ${joinedClauses}\n}`;
  }

  executeMutationExpression(path, proxy, mutationExpressions) {
    return mutationExpressions
      .map(mutationExpression => this.mutationExpressionToQuery(mutationExpression))
      .join('\n;\n');
  }

  expressionToTriplePatterns(pathExpression, queryVar) {
    const root = pathExpression[0];
    const last = pathExpression.length - 2;
    let object = `<${root.subject}>`;
    return pathExpression.slice(1).map((segment, index) => {
      // Obtain triple pattern components
      const subject = object;
      const { predicate } = segment;
      object = index !== last ? `?v${index}` : `?${queryVar}`;
      // Generate triple pattern
      return `${subject} <${predicate}> ${object}.`;
    });
  }

  mutationExpressionToQuery({ mutationType, domainExpression, predicate, rangeExpression }) {
    // Determine the patterns that should appear in the WHERE clause
    const { queryVar: domainQueryVar, clause: domainClause } = this.getQueryVarAndClauses(domainExpression);
    const { queryVar: rangeQueryVar, clause: rangeClause } = this.getQueryVarAndClauses(rangeExpression);
    const clauses = [];
    if (domainClause)
      clauses.push(domainClause);
    if (rangeClause)
      clauses.push(rangeClause);

    // Determine the insert pattern
    const insertPattern = `${domainQueryVar} <${predicate}> ${rangeQueryVar}`;

    // If we don't have any WHERE clauses, we just insert raw data
    if (!clauses.length)
      return `${mutationType} DATA {\n  ${insertPattern}\n}`;

    // Otherwise, return an INSERT ... WHERE ... query
    return `${mutationType} {\n  ${insertPattern}\n} WHERE {\n  ${clauses.join('\n\n  ')}\n}`;
  }

  getQueryVarAndClauses(expression) {
    const lastSegment = expression[expression.length - 1];

    if (expression.length === 1) {
      return {
        queryVar: lastSegment.subject[0] === '"' ? lastSegment.subject : `<${lastSegment.subject}>`,
        clauses: [],
      };
    }

    const queryVar = lastSegment.predicate.match(/[a-z0-9]*$/i)[0] || 'result';
    return {
      queryVar: `?${queryVar}`,
      clause: this.expressionToTriplePatterns(expression, queryVar).join('\n  '),
    };
  }
}
