import PathProxy from '../../src/PathProxy';
import JSONLDResolver from '../../src/JSONLDResolver';
import { createQueryEngine } from '../util';
import { namedNode, literal } from '@rdfjs/data-model';
import defaultHandlers from '../../src/defaultHandlers';

import context from '../context';

import ComunicaEngine from '@ldflex/comunica';
import { Store, Parser } from 'n3';
import PathFactory from '../../src/PathFactory';

const parser = new Parser();
const store = new Store(
  parser.parse(`
      @prefix ex: <http://example.org/> .
      @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

      ex:tomato rdfs:label "Tomate"@en .
      ex:tomato rdfs:label "Second Tomato"@en-gb .
      ex:tomato rdfs:label "Tomaat"@nl .
      ex:tomato rdfs:label "Tomate"@de .
      ex:tomato rdfs:label "Zweite Tomate"@de .

    `)
);
const realQueryEngine = new ComunicaEngine(store);

const factory = new PathFactory({ context, queryEngine: realQueryEngine });
const myTomato = factory.create({ subject: namedNode('http://example.org/tomato') });

const subject = namedNode('https://example.org/tomato');
const queryEngine = createQueryEngine([
  literal('Tomato', 'en'),
  literal('Second Tomato', 'en-gb'),
  literal('Tomaat', 'nl'),
  literal('Tomate', 'de'),
  literal('zweite Tomate', 'de'),
]);

function language(langcode) {
  return literal(undefined, langcode);
}

const fr = language('fr');
const nl = language('nl');
// const de = language('de');

describe('create a query while filtering on langcode', () => {
  let tomato;
  beforeAll(() => {
    const resolvers = [
      new JSONLDResolver(context),
    ];

    const pathProxy = new PathProxy({ handlers: defaultHandlers, resolvers });
    tomato = pathProxy.createPath({ queryEngine }, { subject });
  });

  it('returns a query with the selected language', async () => {
    const query1 = await tomato.label(nl).sparql;
    expect(query1).toContain('FILTER(lang(?label) = \'nl\')');

    const query2 = await tomato.label(fr).sparql;
    expect(query2).toContain('FILTER(lang(?label) = \'fr\')');

    const queryWithout = await tomato.label.sparql;
    expect(queryWithout).not.toContain('FILTER(lang(');
  });
});

describe('getting the right results when filtering on langcode', () => {
  it('returns results in the selected language', async () => {
    const nlLabel = await myTomato.label(nl).value;
    expect(nlLabel).toBe('Tomaat');
  });
});
