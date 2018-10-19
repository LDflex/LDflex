/**
 * Expresses a path as a SPARQL query.
 *
 * Requires:
 * - a pathExpression property on the path proxy
 */
export default class SparqlHandler {
  async execute(path, proxy) {
    const pathExpression = await proxy.pathExpression;
    if (!Array.isArray(pathExpression))
      throw new Error(`${path} has no pathExpression property`);

    // Require at least a subject and a link
    if (pathExpression.length < 2)
      throw new Error(`${path} should at least contain a subject and a predicate`);
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
