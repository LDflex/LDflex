import PathExpressionHandler from './PathExpressionHandler';

/**
 * Expresses a chain of QueryPath instances as a SPARQL query.
 */
export default class SparqlHandler extends PathExpressionHandler {
  async execute(queryPath) {
    const pathExpression = await super.execute(queryPath);

    // Require at least a subject and a link
    if (pathExpression.length < 2)
      throw new Error('Path should at least contain a subject and a predicate');
    const root = pathExpression.shift();

    // Determine the query variable name
    const queryVar = queryPath.property.match(/[a-z0-9]*$/i)[0] || 'result';

    // Build basic graph pattern
    const last = pathExpression.length - 1;
    let object = `<${root.subject}>`;
    const clauses = pathExpression.map((path, index) => {
      // Obtain triple pattern components
      const subject = object;
      const { predicate } = path;
      object = index !== last ? `?v${index}` : `?${queryVar}`;
      // Generate triple pattern
      return `${subject} <${predicate}> ${object}.`;
    });

    // Embed the basic graph pattern into a SPARQL query
    const joinedClauses = clauses.join('\n  ');
    return `SELECT ?${queryVar} WHERE {\n  ${joinedClauses}\n}`;
  }
}
