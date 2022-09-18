import { namedNode } from '@rdfjs/data-model';
import { lang, langMatches } from '../../src/filters';
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

const fr = lang('fr');
const nl = lang('nl');
const de = lang('de');
const en = lang('en');

const english = langMatches('en');

describe('create a query while filtering on langcode', () => {
  it('returns a query with the selected language', async () => {
    const query1 = await tomato.label(nl).sparql;
    expect(query1).toBe(deindent(`
      SELECT ?label WHERE {
        <http://example.org/tomato> <http://www.w3.org/2000/01/rdf-schema#label> ?label.
        FILTER(lang(?label) = 'nl')
      }`)
    );

    const query2 = await tomato.label(fr).sparql;
    expect(query2).toBe(deindent(`
      SELECT ?label WHERE {
        <http://example.org/tomato> <http://www.w3.org/2000/01/rdf-schema#label> ?label.
        FILTER(lang(?label) = 'fr')
      }`)
    );

    const query3 = await tomato.label(fr, de).sparql;
    expect(query3).toBe(deindent(`
      SELECT ?label WHERE {
        <http://example.org/tomato> <http://www.w3.org/2000/01/rdf-schema#label> ?label.
        FILTER(lang(?label) = 'fr' || lang(?label) = 'de')
      }`)
    );

    const queryWithout = await tomato.label.sparql;
    expect(queryWithout).not.toContain('FILTER(lang(');
  });
});

describe('getting the right results when filtering on langcode', () => {
  it('returns results in the selected language', async () => {
    const nlLabel = await tomato.label(nl).value;
    expect(nlLabel).toBe('Tomaat');
  });

  it('returns results in the that match the language', async () => {
    const englishLabels = await tomato.label(english).values;
    expect(englishLabels).toStrictEqual(['Tomato', 'Second Tomato']);

    const englishQuery = await tomato.label(english).sparql;
    expect(englishQuery).toBe(deindent(`
      SELECT ?label WHERE {
        <http://example.org/tomato> <http://www.w3.org/2000/01/rdf-schema#label> ?label.
        FILTER(langMatches(lang(?label), 'en'))
      }`)
    );

    const enLabel = await tomato.label(en).values;
    expect(enLabel).toStrictEqual(['Tomato']);
  });
});
