/**
 * Queries for all subjects in the current queryEngine source
 */
export const SELECT_ALL_SUBJECTS = 'SELECT distinct ?thing WHERE { ?thing ?pred ?type }';
export default class SubjectsHandler {
  async *handle(pathData) {
    // Retrieve the query engine
    const { queryEngine } = pathData.settings;
    if (!queryEngine)
      throw new Error(`${pathData} has no queryEngine setting`);

    // simply execute the query and yield the results
    for await (const bindings of queryEngine.execute(SELECT_ALL_SUBJECTS))
      yield this.extractTerm(bindings, pathData);
  }

  extractTerm(binding, pathData) {
    // Extract the first term from the binding map
    const term = binding.values().next().value;
    // Each result is a new path that starts from the given term as subject
    return pathData.extendPath({ subject: term }, null);
  }
}
