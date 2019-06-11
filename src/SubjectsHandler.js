/**
 * Queries for all subjects in the current queryEngine source
 */
export default class SubjectsHandler {

  async *handle(pathData, path) {
    const SELECT_ALL_SUBJECTS = `SELECT distinct ?thing WHERE { ?thing ?pred ?type }`;

    // Retrieve the query engine
    const { queryEngine } = pathData.settings;
    if (!queryEngine)
      throw new Error(`${pathData} has no queryEngine setting`);

    //simply execute the query and yield the results
    for await (const bindings of queryEngine.execute(SELECT_ALL_SUBJECTS))
      yield this.extractTerm(bindings, pathData);
  }

  extractTerm(binding, pathData) {
    // Extract the first term from the binding map
    if (binding.size !== 1)
      throw new Error('Only single-variable queries are supported');
    const term = binding.values().next().value;

    // Each result is a new path that starts from the given term as subject
    return pathData.extendPath({ subject: term }, null);
  }
}
