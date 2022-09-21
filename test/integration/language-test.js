import { namedNode } from '@rdfjs/data-model';
import context from '../context';
import ComunicaEngine from '@ldflex/comunica';
import { Store, Parser } from 'n3';
import PathFactory from '../../src/PathFactory';
import { deindent } from '../util';

const parser = new Parser();
const store = new Store(
  parser.parse(`
      @prefix ex: <http://example.org/> .
      @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

      ex:tomato rdfs:label "Tomato"@en .
      ex:tomato rdfs:label "Second Tomato"@en-gb .
      ex:tomato rdfs:label "Tomaat"@nl .
      ex:tomato rdfs:label "Tomate"@de .
      ex:tomato rdfs:label "Zweite Tomate"@de .
    `)
);

const queryEngine = new ComunicaEngine(store);
const factory = new PathFactory({ context, queryEngine });
const tomato = factory.create({ subject: namedNode('http://example.org/tomato') });

describe('create a query while matching on langcode', () => {
  it('returns a query with the selected language', async () => {
    const query1 = await tomato.label.lang('nl').sparql;
    expect(query1).toBe(deindent(`
      SELECT ?label WHERE {
        <http://example.org/tomato> <http://www.w3.org/2000/01/rdf-schema#label> ?label.
        FILTER (isLiteral(?label) && langMatches(lang(?label), 'nl') || !isLiteral(?label))
      }`)
    );

    const query2 = await tomato.label.lang('fr', 'de').sparql;
    expect(query2).toBe(deindent(`
      SELECT ?label WHERE {
        <http://example.org/tomato> <http://www.w3.org/2000/01/rdf-schema#label> ?label.
        FILTER (isLiteral(?label) && (langMatches(lang(?label), 'fr') || langMatches(lang(?label), 'de')) || !isLiteral(?label))
      }`)
    );

    const queryWithout = await tomato.label.sparql;
    expect(queryWithout).not.toContain('FILTER(lang');
  });
});

describe('create a query while filtering on exact langcode', () => {
  it('returns a query with the selected language', async () => {
    const query = await tomato.label.lang({ exact: 'fr' }).sparql;
    expect(query).toBe(deindent(`
      SELECT ?label WHERE {
        <http://example.org/tomato> <http://www.w3.org/2000/01/rdf-schema#label> ?label.
        FILTER (isLiteral(?label) && lang(?label) = 'fr' || !isLiteral(?label))
      }`)
    );

    const query2 = await tomato.label.lang('fr', { exact: 'de' }).sparql;
    expect(query2).toBe(deindent(`
      SELECT ?label WHERE {
        <http://example.org/tomato> <http://www.w3.org/2000/01/rdf-schema#label> ?label.
        FILTER (isLiteral(?label) && (langMatches(lang(?label), 'fr') || lang(?label) = 'de') || !isLiteral(?label))
      }`)
    );
  });
});

describe('getting the right results when filtering on langcode', () => {
  it('returns results in the selected language', async () => {
    const nlLabel = await tomato.label.lang('nl').value;
    expect(nlLabel).toBe('Tomaat');
  });
});

describe('getting the right results when filtering on langcode with a set language', () => {
  it('returns results in the selected language', async () => {
    const dutchTomato = tomato.withLangPrefs('nl');
    const nlLabel = await dutchTomato.label.value;
    expect(nlLabel).toBe('Tomaat');

    const label = await tomato.label.value;
    expect(label).toBe('Tomato');
  });
});
