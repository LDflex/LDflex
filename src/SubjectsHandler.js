import ExecuteQueryHandler from './ExecuteQueryHandler';

/**
 * Queries for all subjects in the current queryEngine source
 */
export default class SubjectsHandler extends ExecuteQueryHandler {
  async *handle(pathData) {
    // Retrieve the query engine
    const { queryEngine } = pathData.settings;
    if (!queryEngine)
      throw new Error(`${pathData} has no queryEngine setting`);

    // simply execute the query and yield the results
    for await (const bindings of queryEngine.execute('SELECT distinct ?s WHERE { ?s ?p ?o }'))
      yield this.extractTerm(bindings, pathData);
  }
}
