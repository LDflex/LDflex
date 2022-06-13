import { namedNode } from '@rdfjs/data-model';
import { Data, order } from '../types';
import { variable } from '@rdfjs/data-model'
import * as RDF from 'rdf-js'
import { toSparql, Algebra, translate, Factory } from 'sparqlalgebrajs'


const factory = new Factory()

enum order {
    ASC = 'asc',
    DESC = 'desc'
}

function makeVariable(input: string | RDF.Variable): RDF.Variable
function makeVariable(input: string | RDF.Term): RDF.Term {
  return typeof input === 'string' ? variable(input) : input
}

class OperationBuilder {
  private expressions: Algebra.Expression[] = []
  //private filter = []
  //private limit = []
  //private offset = []
  private patterns: Algebra.Pattern[] = []
  private variables: RDF.Variable[] = []
  distinct: boolean = false;

  algebra(): Algebra.Operation {
    const bgp = factory.createBgp(this.patterns)
    const project = factory.createProject(factory.createOrderBy(bgp, this.expressions), this.variables)
    return translate(toSparql(this.distinct ? factory.createDistinct(project) : project))
  }

  sparql() {
    return toSparql(this.algebra())
  }
  // @ts-ignore
  addPattern(subject: RDF.Quad_Subject, predicate: RDF.Quad_Predicate, object: RDF.Quad_Object, graph?: RDF.Quad_Graph, reverse: boolean = false) {
    this.patterns.push(factory.createPattern(
      reverse ? object : subject, 
      predicate, 
      reverse ? subject : object, 
      graph
      )
    )
  }

  addVariable(variable: string | RDF.Variable) {
    this.variables.push(makeVariable(variable))
  }

  addOrderBy(variable: string | RDF.Variable, ordering: order = order.ASC) {
      // @ts-ignore
    this.expressions.push(
        ordering === order.DESC ?
        // @ts-ignore
        factory.createOperatorExpression(ordering, [factory.createTermExpression(makeVariable(variable))]) :
        // @ts-ignore
        factory.createTermExpression(makeVariable(variable))
        )
  }
  // @ts-ignore
  addFilter(filter, expression) {
      // @ts-ignore
      this.expressions.push(factory.createFilter(
        filter,
        expression
      ))
  }

}



// class SparqlBuilder {
//   private _algebra: Algebra.Operation
//   constructor(query: string | Algebra.Operation) {
//     this._algebra = typeof query === 'string' ? translate(query) : query
//   }

//   sparql() {
//     return toSparql(this._algebra)
//   }

//   algebra() {
//     return this._algebra
//   }

// // }
// const factory = new Factory()

// function makeVariable(input: string | RDF.Variable) {
//   return typeof input === 'string' ? variable(input) : input
// }

// class OperationBuilder {
//   private expressions: Algebra.Expression[] = []
//   //private filter = []
//   //private limit = []
//   //private offset = []
//   private patterns: Algebra.Pattern[] = []
//   private variables: RDF.Variable[] = []


//   algebra(): Algebra.Operation {
//     const bgp = factory.createBgp(this.patterns)
//     // const filter = factory.createFilter(null, bgp)
//     const orderBy = factory.createOrderBy(bgp, this.expressions)
//   }

//   sparql() {
//     toSparql(this.algebra())
//   }

//   addPattern(subject: RDF.Quad_Subject, predicate: RDF.Quad_Predicate, object: RDF.Quad_Object, graph?: RDF.Quad_Graph) {
//     this.patterns.push(factory.createPattern(subject, predicate, object, graph))
//   }

//   addVariables(variable: string | RDF.Variable) {
//     this.variables.push(makeVariable(variable))
//   }

//   addOrderBy(variable: string | RDF.Variable, ordering: order = order.ASC) {
//     this.expressions.push(factory.createOperatorExpression(ordering, [factory.createTermExpression(makeVariable(variable))])
//   }
// }


// class OperationsHanlder {
//   constructor(private operation: Algebra.Operation) {}

//   addExpression({
//     type, expression, operator, args
//   }: {
//     expression: Algebra.Expression
//   }) {
//     Algebra.expressionTypes
//   }

// }



const NEEDS_ESCAPE = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
      ESCAPE_ALL = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
      ESCAPED_CHARS = {
        '\\': '\\\\', '"': '\\"', '\t': '\\t',
        '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f',
      };

/**
 * Expresses a path or mutation as a SPARQL query.
 *
 * Requires:
 * - a mutationExpressions or pathExpression property on the path proxy
 */
export default class SparqlHandler {
  async handle(pathData: Data, path: Data) {
    // First check if we have a mutation expression
    const mutationExpressions = await path.mutationExpressions;
    if (Array.isArray(mutationExpressions) && mutationExpressions.length)
      // Remove empty results to prevent dangling semicolons
      return mutationExpressions.map(e => this.mutationExpressionToQuery(e)).filter(Boolean).join('\n;\n');

    // Otherwise, fall back to checking for a path expression
    const pathExpression = await path.pathExpression;
    if (!Array.isArray(pathExpression))
      throw new Error(`${pathData} has no pathExpression property`);
    return this.pathExpressionToQuery(pathData, path, pathExpression);
  }

  pathExpressionToQuery(pathData: Data, path: Data, pathExpression) {
    const builder = new OperationBuilder()
    let queryVar = '?subject'

    if (pathExpression.length < 2 && !pathData.finalClause)
      throw new Error(`${pathData} should at least contain a subject and a predicate`);

    // Create triple patterns
    if (pathExpression.length > 1) {
      queryVar = this.createVar(pathData.property);
      const lastIndex = pathExpression.length - 1;
      let object = skolemize(root.subject);
      let queryVar = object;
      let allowValues = false;
      pathExpression.forEach(({ predicate, reverse, sort, values }, index) => {
        // Obtain components and generate triple pattern
        const subject = object;
  
        // Use fixed object values values if they were specified
        let objects;
        if (values && values.length > 0) {
          if (!allowValues)
            throw new Error('Specifying fixed values is not allowed here');
          objects.forEach(obj => { builder.addPattern(subject, predicate, obj, null, reverse) })
          
          objects = values.map(this.termToString);
          allowValues = false; // disallow subsequent fixed values for this predicate
        }
        // Otherwise, use a variable subject
        else {
          object = index < lastIndex ? this.createVar(`v${index}`, scope) : lastVar;
          objects = [object];
          allowValues = true;
        }


        // If the sort option was not set, use this object as a query variable
        if (!sort)
          queryVar = object;
        // If sort was set, use this object as a sorting variable
        else {
          // TODO: handle when an object is used for sorting, and later also for querying
          builder.addOrderBy(object, sort)
          // TODO: use a descriptive lastVar in case of sorting
          object = queryVar;
        }
      });
    }

    builder.addVariable(pathData.select ?? queryVar)
    builder.distinct = pathData.distinct ?? false

    

    let queryVar = '?subject', sorts = [], clauses = [];
    if (pathExpression.length > 1) {
      queryVar = this.createVar(pathData.property);
      ({ queryVar, sorts, clauses } = this.expressionToTriplePatterns(pathExpression, queryVar));
    }
    if (pathData.finalClause)
      clauses.push(pathData.finalClause(queryVar));

    builder.addVariable()



      const factory = new Factory()
    
    factory.createBgp([
      factory.createPattern()
    ])
    
    
    
    
    
    factory.createOrderBy({

    })

    factory.createTermExpression(RDF.variable())

    let algebra: Algebra.Operation = {
      type: Algebra.types.PROJECT,
      variables: [pathData.select ?? queryVar],
      input: { 
        type: Algebra.types.ORDER_BY,
        input: {
          type: Algebra.types.BGP,

        },
        expressions: sorts.map(({order, variable}) => factory.createOrderBy({
          type: Algebra.types.,
          
        }, [{
          expressionType: Algebra.expressionTypes.TERM,
          type: Algebra.types.EXPRESSION
        }])
        
        
      //   ({
      //     type: Algebra.types.EXPRESSION,
      //     expressionType: Algebra.expressionTypes.OPERATOR,
      //     operator: order,
      //     args: [{
      //       type: Algebra.types.EXPRESSION,
      //       expressionType: Algebra.expressionTypes.TERM,
      //       term: variable
      //     }]
      // })
      
      
      ) }
    }
    
    
    
    algebra = pathData.distinct ? {type: Algebra.types.DISTINCT, input: algebra } : algebra


    // Create SPARQL query body
    const distinct = pathData.distinct ? 'DISTINCT ' : '';
    const select = `SELECT ${distinct}${pathData.select ? pathData.select : queryVar}`;
    const where = ` WHERE {\n  ${clauses.join('\n  ')}\n}`;
    const orderClauses = sorts.map(({ order, variable }) => `${order}(${variable})`);
    const orderBy = orderClauses.length === 0 ? '' : `\nORDER BY ${orderClauses.join(' ')}`;
    return `${select}${where}${orderBy}`;
  }

  mutationExpressionToQuery({ mutationType, conditions, predicateObjects }) {
    // If there are no mutations, there is no query
    if (!mutationType || !conditions || predicateObjects && predicateObjects.length === 0)
      return '';

    // Create the WHERE clauses
    const scope = {};
    let subject, where;
    // If the only condition is a subject, we need no WHERE clause
    if (conditions.length === 1) {
      subject = this.termToString(conditions[0].subject);
      where = [];
    }
    // Otherwise, create a WHERE clause from all conditions
    else {
      const lastPredicate = conditions[conditions.length - 1].predicate;
      subject = this.createVar(lastPredicate.value, scope);
      ({ queryVar: subject, clauses: where } =
        this.expressionToTriplePatterns(conditions, subject, scope));
    }

    // Create the mutation clauses
    const mutations = [];
    for (const { predicate, reverse, objects } of predicateObjects) {
      // Mutate either only the specified objects, or all of them
      const objectStrings = objects ?
        objects.map(o => this.termToString(o)) :
        [this.createVar(predicate.value, scope)];
      // Generate a triple pattern for all subjects
      mutations.push(...this.triplePatterns(subject, predicate, objectStrings, reverse));
    }
    const mutationClauses = `{\n  ${mutations.join('\n  ')}\n}`;

    // Join clauses into a SPARQL query
    return where.length === 0 ?
      // If there are no WHERE clauses, just mutate raw data
      `${mutationType} DATA ${mutationClauses}` :
      // Otherwise, return a DELETE/INSERT ... WHERE ... query
      `${mutationType} ${mutationClauses} WHERE {\n  ${where.join('\n  ')}\n}`;
  }

  expressionToTriplePatterns([root, ...pathExpression], lastVar, scope = {}) {
    const lastIndex = pathExpression.length - 1;
    const clauses = [];
    const sorts = [];
    let object = this.termToString(skolemize(root.subject));
    let queryVar = object;
    let allowValues = false;
    pathExpression.forEach((segment, index) => {
      // Obtain components and generate triple pattern
      const subject = object;
      const { predicate, reverse, sort, values } = segment;

      // Use fixed object values values if they were specified
      let objects;
      if (values && values.length > 0) {
        if (!allowValues)
          throw new Error('Specifying fixed values is not allowed here');
        objects = values.map(this.termToString);
        allowValues = false; // disallow subsequent fixed values for this predicate
      }
      // Otherwise, use a variable subject
      else {
        object = index < lastIndex ? this.createVar(`v${index}`, scope) : lastVar;
        objects = [object];
        allowValues = true;
      }
      clauses.push(...this.triplePatterns(subject, predicate, objects, reverse));

      // If the sort option was not set, use this object as a query variable
      if (!sort) {
        queryVar = object;
      }
      // If sort was set, use this object as a sorting variable
      else {
        // TODO: handle when an object is used for sorting, and later also for querying
        sorts.push({ variable: object, order: sort });
        // TODO: use a descriptive lastVar in case of sorting
        object = queryVar;
      }
    });
    return { queryVar, sorts, clauses };
  }

  // Creates a unique query variable within the given scope, based on the suggestion
  createVar(suggestion = '', scope?) {
    let counter = 0;
    let label = `?${suggestion.match(/[a-z0-9]*$/i)[0] || 'result'}`;
    if (scope) {
      suggestion = label;
      while (scope[label])
        label = `${suggestion}_${counter++}`;
      scope[label] = true;
    }
    return label;
  }

  // Converts an RDFJS term to a string that we can use in a query
  termToString(term) {
    // Determine escaped value
    let { value } = term;
    if (NEEDS_ESCAPE.test(value))
      value = value.replace(ESCAPE_ALL, escapeCharacter);

    switch (term.termType) {
    case 'NamedNode':
      return `<${value}>`;

    case 'BlankNode':
      return `_:${value}`;

    case 'Literal':
      // Determine optional language or datatype
      let suffix = '';
      if (term.language)
        suffix = `@${term.language}`;
      else if (term.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string')
        suffix = `^^<${term.datatype.value}>`;
      return `"${value}"${suffix}`;

    default:
      throw new Error(`Could not convert a term of type ${term.termType}`);
    }
  }

  // Creates triple patterns for the given subject, predicate, and objects
  triplePatterns(subjectString, predicateTerm, objectStrings, reverse = false) {
    let subjectStrings = [subjectString];
    if (reverse)
      [subjectStrings, objectStrings] = [objectStrings, subjectStrings];
    const objects = objectStrings.join(', ');
    return subjectStrings.map(s => `${s} <${predicateTerm.value}> ${objects}.`);
  }
}

// Replaces a character by its escaped version
// (borrowed from https://www.npmjs.com/package/n3)
function escapeCharacter(character) {
  // Replace a single character by its escaped version
  let result = ESCAPED_CHARS[character];
  if (result === undefined) {
    // Replace a single character with its 4-bit unicode escape sequence
    if (character.length === 1) {
      result = character.charCodeAt(0).toString(16);
      result = '\\u0000'.substr(0, 6 - result.length) + result;
    }
    // Replace a surrogate pair with its 8-bit unicode escape sequence
    else {
      result = ((character.charCodeAt(0) - 0xD800) * 0x400 +
                 character.charCodeAt(1) + 0x2400).toString(16);
      result = '\\U00000000'.substr(0, 10 - result.length) + result;
    }
  }
  return result;
}

// Skolemizes the given term if it is a blank node
let skolemId = 0;
function skolemize(term: RDF.Term): RDF.Term {
  if (term.termType !== 'BlankNode')
    return term;
  if (!term.skolemized)
    term.skolemized = namedNode(`urn:ldflex:sk${skolemId++}`);
  return term.skolemized;
}