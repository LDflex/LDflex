import { toSparql, Algebra, translate, Factory } from 'sparqlalgebrajs'
import * as RDF from '@rdfjs/types';
const { createSeq, createPath, createInv } = new Factory;

const seq = createSeq(
  [createSeq([]), createSeq([]), createInv(createSeq([]))], 
)

const path = createPath(

)


path.subject

class SparqlBuilder {
  private factory: Factory;
  private _variables?: RDF.Variable[];
  distinct = false;

  constructor(factory?: Factory) {
    this.factory = factory || new Factory();
  }

  get variables(): RDF.Variable[] {
    if (this._variables)
      return this._variables;

    // TODO: Lazily calculate variables using the
    // this.operation or this.pattern
    throw new Error('Not Implemented');
  }

  get operation(): Algebra.Operation {

  }

  get select(): Algebra.Project {
    return this.factory.createProject(this.operation, this.variables)
  }

  get construct(): Algebra.Construct {

  }

  get ask() {
    return this.factory.createAsk(this.operation);
  }
}
