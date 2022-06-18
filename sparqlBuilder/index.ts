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
  private _variables?: RDF.Variable[];
  private _template?: Algebra.Pattern[];

  distinct = false;

  constructor(private factory = new Factory()) {
  }

  get variables(): RDF.Variable[] {
    if (this._variables)
      return this._variables;

    // TODO: Lazily calculate variables using the
    // this.operation or this.pattern
    throw new Error('Not Implemented');
  }

  get template(): Algebra.Pattern[] {
    if (this._template)
      return this._template;

    const { operation } = this;
    if (operation.type === Algebra.types.BGP) {
      return operation.patterns;
    }

    throw new Error('Not Implemented');
  }

  get operation(): Algebra.Operation {
    throw new Error('Not Implemented');
  }

  get select(): Algebra.Project {
    return this.factory.createProject(this.operation, this.variables)
  }

  get construct(): Algebra.Construct {
    return this.factory.createConstruct(this.operation, this.template);
  }

  get ask() {
    return this.factory.createAsk(this.operation);
  }
}
