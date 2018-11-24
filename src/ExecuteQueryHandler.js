/**
 * Executes the query represented by a path.
 *
 * Requires:
 * - a queryEngine property in the path settings
 * - a sparql property on the path proxy
 */
export default class ExecuteQueryHandler {
  async *execute(path, pathProxy) {
    // Retrieve the query engine and query
    const { queryEngine } = path.settings;
    if (!queryEngine)
      throw new Error(`${path} has no queryEngine setting`);
    const query = await pathProxy.sparql;
    if (!query)
      throw new Error(`${path} has no sparql property`);

    // Extract the term from every query result
    for await (const bindings of queryEngine.execute(query))
      yield this.extractTerm(bindings);
  }

  /**
   * Extracts the first term from a query result binding.
   */
  extractTerm(binding) {
    // Extract the first term from the binding map
    if (binding.size !== 1)
      throw new Error('Only single-variable queries are supported');
    const term = binding.values().next().value;

    // Simplify string conversion of the term
    term.toString = Term.prototype.getValue;
    term.toPrimitive = Term.prototype.getValue;

    return term;
  }
}

class Term {
  getValue() {
    return this.value;
  }
}
