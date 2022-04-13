import { Bindings, Term, StringSparqlQueryable, BindingsResultSupport } from '@rdfjs/types';

interface Settings {
  queryEngine: StringSparqlQueryable<BindingsResultSupport>;
}

interface PathData {
  settings: Settings;
  resultsCache: Promise<Map<string, Term>> | Map<string, Term>;
}

/**
 * Executes the query represented by a path.
 *
 * Requires:
 * - a queryEngine property in the path settings
 * - a sparql property on the path proxy
 * - (optional) a resultsCache property on the path data
 */
export default class ExecuteQueryHandler {
  async *handle(pathData: PathData, path) {
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
    if (query === null || query === undefined)
      throw new Error(`${pathData} has no sparql property`);
    // No results if the query is empty
    if (query.length === 0)
      return;

    // Extract the term from every query result
    for await (const bindings of await queryEngine.queryBindings(query))
      yield pathData.extendPath({ subject: getSingleTerm(bindings) }, null);
  }
}

function getSingleTerm(binding: Bindings): Term {
  // Extract the first term from the binding map
  if (binding.size !== 1)
    throw new Error('Only single-variable queries are supported');

  for (const subject of binding.values()) return subject;
}
