import toSingularHandler from './toSingularHandler';

/**
 * Executes the query represented by a path.
 *
 * Requires:
 * - a queryEngine property in the path settings
 * - a sparql property on the path proxy
 */
export default class ExecuteQueryHandler {
  constructor({ single } = {}) {
    if (single) {
      console.warn('The single option is deprecated in favor of toSingularHandler');
      return toSingularHandler(this);
    }
  }

  execute(path, pathProxy) {
    let results;
    const next = async () => {
      if (!results) {
        // Retrieve the query engine and query
        const { queryEngine } = path.settings;
        if (!queryEngine)
          throw new Error(`${path} has no queryEngine setting`);
        const query = await pathProxy.sparql;
        if (!query)
          throw new Error(`${path} has no sparql property`);
        // Create an asynchronous iterator over the query results
        results = queryEngine.execute(await query);
      }
      // Obtain the next binding and extract the result term
      const { value, done } = await results.next();
      return done ? { done } : { value: this.extractTerm(value) };
    };
    return () => ({ next });
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
