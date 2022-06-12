import { Handler } from "./types";
import { Factory } from "sparqlalgebrajs";
import { variable } from "@rdfjs/data-model";
const { createDistinct, createProject, createBgp, createPattern } = new Factory();

createDistinct(
  createProject(
    createBgp([ createPattern(variable('s'), variable('p'), variable('o')) ]),
    [ variable('s') ]
  )
)

/**
 * Queries for all subjects of a document
 */
export default class SubjectsHandler implements Handler {
  handle(pathData) {
    return pathData.extendPath({
      distinct: true,
      select: '?subject',
      finalClause: () => '?subject ?predicate ?object.',
      property: pathData.property,
    });
  }
}
