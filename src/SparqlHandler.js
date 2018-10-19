import PathExpressionHandler from './PathExpressionHandler';

/**
 * Expresses a path as a SPARQL query.
 */
export default class SparqlHandler extends PathExpressionHandler {
  async execute(path) {
    const pathExpression = await super.execute(path);

    // Require at least a subject and a link
    if (pathExpression.length < 2)
      throw new Error('Path should at least contain a subject and a predicate');
    const root = pathExpression.shift();

    // Determine the query variable name
    const queryVar = path.property.match(/[a-z0-9]*$/i)[0] || 'result';

    // Build basic graph pattern
    const last = pathExpression.length - 1;
    let object = `<${root.subject}>`;
    const clauses = pathExpression.map((segment, index) => {
      // Obtain triple pattern components
      const subject = object;
      const { predicate } = segment;
      object = index !== last ? `?v${index}` : `?${queryVar}`;
      // Generate triple pattern
      return `${subject} <${predicate}> ${object}.`;
    });

    // Embed the basic graph pattern into a SPARQL query
    const joinedClauses = clauses.join('\n  ');
    return `SELECT ?${queryVar} WHERE {\n  ${joinedClauses}\n}`;
  }
}
