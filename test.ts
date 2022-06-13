import { Parser } from 'sparqljs';
const parser = new Parser({
  
})

const x = parser.parse(`
PREFIX ex: <http://example.org/>

SELECT * WHERE { ?s ex:a/ex:b ?o }
`)
console.log(x)