/**
 * Executes the query represented by a path.
 *
 * Requires:
 * - a queryEngine property in the path settings
 * - a sparql property on the path proxy
 * - (optional) a resultsCache property on the path data
 */
export default class ExecuteQueryHandler {
  async *handle(pathData, path) {
    // Try to retrieve the result from cache
    const resultsCache = await pathData.resultsCache;
    if (resultsCache) {
      for (const result of resultsCache)
        yield result;
      return;
    }

    // Retrieve the query engine and query
    const { queryEngine } = pathData.settings;
    if (!queryEngine)
      throw new Error(`${pathData} has no queryEngine setting`);
    const query = await path.sparql;
    if (!query)
      throw new Error(`${pathData} has no sparql property`);

    // Extract the term from every query result
    for await (const bindings of queryEngine.execute(query))
      yield this.extractTerm(bindings, pathData);
  }

  /**
   * Extracts the first term from a query result binding as a new path.
   */
  extractTerm(binding, pathData) {
    // Extract the first term from the binding map
    if (binding.size !== 1)
      throw new Error('Only single-variable queries are supported');
    const subject = binding.values().next().value;

    // Each result is a new path that starts from the term as subject
    return pathData.extendPath({ subject }, null);
  }
}
