const VARIABLE = /(SELECT\s+)(\?\S+)/;
const QUERY_TAIL = /\}[^}]*$/;

/**
 * Returns a function that preloads and caches
 * certain properties of results on the current path.
 *
 * Requires:
 * - a predicate handler on the path proxy
 * - a queryEngine property in the path settings
 *
 * Creates:
 * - a resultsCache property on the path data
 */
export default class PreloadHandler {
  /**
   * Creates a preload function.
   */
  handle(pathData, pathProxy) {
    return async (...properties) => {
      if (properties.length > 0) {
        // Map the properties to predicates
        const predicates = await Promise.all(properties.map(async p =>
          (await pathProxy[p].predicate).value));

        // Create and attach the results cache to the path data
        pathData.resultsCache =
          await this.createResultsCache(predicates, pathData, pathProxy);
      }
      return pathProxy;
    };
  }

  /**
   * Creates a cache for the results of
   * resolving the given predicates against the path.
   */
  async createResultsCache(predicates, pathData, path) {
    // Execute the preloading query
    const { query, vars, resultVar } = await this.createQuery(predicates, path);
    const { settings: { queryEngine } } = pathData;
    const bindings = queryEngine.execute(query);

    // Extract all results and their preloaded property values
    const resultsCache = {};
    const propertyCaches = {};
    for await (const binding of bindings) {
      // Initialize the result's cache if needed
      const result = binding.get(resultVar), hash = hashTerm(result);
      if (!(hash in resultsCache)) {
        // Create the property cache
        const propertyCache = propertyCaches[hash] = {};
        for (const predicate of predicates)
          propertyCache[predicate] = [];
        // Create the result path
        const resultData = { subject: result, propertyCache };
        resultsCache[hash] = pathData.extendPath(resultData, null);
      }

      // Create and cache a possible property value path from the binding
      const propertyCache = propertyCaches[hash];
      for (let i = 0; i < vars.length; i++) {
        const value = binding.get(vars[i]);
        if (value) {
          const valuePath = pathData.extendPath({ subject: value }, null);
          propertyCache[predicates[i]].push(valuePath);
        }
      }
    }
    return Object.values(resultsCache);
  }

  /**
   * Creates the query for preloading the given predicates on the path
   */
  async createQuery(predicates, path) {
    // Obtain the query for the current path, and its main variable
    const parentQuery = await path.sparql;
    const variableMatch = VARIABLE.exec(parentQuery);
    if (!variableMatch)
      throw new Error(`Unexpected path query: ${parentQuery}`);
    const resultVar = variableMatch[2];

    // Modify the query to include the preload clauses
    // TODO: instead of query manipulation, adjust the query generator
    const vars = predicates.map((p, i) => `?preload_${i}`);
    const preloadClauses = predicates.map((predicate, i) =>
      `    { ${resultVar} <${predicate}> ${vars[i]}. }`)
      .join('\n    UNION\n');
    const query = parentQuery
      .replace(VARIABLE, `$1$2 ${vars.join(' ')}`)
      .replace(QUERY_TAIL, `  OPTIONAL {\n${preloadClauses}\n  }\n$&`);
    return { query, vars, resultVar };
  }
}

// Returns a unique string representation of the term
function hashTerm(term) {
  const { termType, value } = term;
  switch (termType) {
  case 'NamedNode':
    return value;
  case 'Literal':
    const { language, datatype } = term;
    return `${termType}|${language}|${datatype.value}|${value}`;
  default:
    return `${termType}|${value}`;
  }
}
