import SparqlHandler from './SparqlHandler';

/**
 * Executes the query represented by a QueryPath.
 */
export default class ExecuteQueryHandler extends SparqlHandler {
  execute(queryPath) {
    // Retrieve the query engine and query
    const { queryEngine } = queryPath.settings;
    if (!queryEngine)
      throw new Error(`No query engine defined in ${queryPath}`);
    const query = super.execute(queryPath);

    // Return an asynchronous iterator over the query results
    let resultsIterator;
    async function next() {
      if (!resultsIterator)
        resultsIterator = queryEngine.execute(await query);
      return resultsIterator.next();
    }
    return () => ({ next });
  }
}
