import PathFactory from '../../src/PathFactory';
import ComunicaEngine from 'ldflex-comunica';
import { namedNode } from '@rdfjs/data-model';

/**
 * These tests are skipped since they need Internet
 *
 */
describe.skip('end to end tests using ldflex-comunica', () => {
  let path;

  beforeAll(() => {
    const context = {
      '@context': {
        '@vocab': 'http://xmlns.com/foaf/0.1/',
        'friends': 'knows',
        'name': 'http://xmlns.com/foaf/0.1/name',
        'label': 'http://www.w3.org/2000/01/rdf-schema#label',
      },
    };
    // The query engine and its source
    const queryEngine = new ComunicaEngine('https://ruben.verborgh.org/profile/');
    // The object that can create new paths
    path = new PathFactory({ context, queryEngine });
  });

  it('looking up data on the web', async () => {
    const person = path.create({ subject: namedNode('https://ruben.verborgh.org/profile/#me') });
    expect(`${await person.name}`).toEqual('Ruben Verborgh');

    const interests = [];
    for await (const name of person.interest.label)
      interests.push(`${name}`);

    expect(interests.length).toBeGreaterThan(5);
    expect(interests).toContain('Decentralization');

    const friends = [];
    for await (const name of person.friends.givenName)
      friends.push(`${name}`);

    expect(friends.length).toBeGreaterThan(10);
    expect(friends).toContain('Pierre-Antoine');
  });

  it('dynamically looking up data on the web with properties', async () => {
    const person = path.create({ subject: namedNode('https://ruben.verborgh.org/profile/#me') });

    const values = [];
    const properties = [];
    for await (const p of person.properties) {
      properties.push(`${await p}`);
      values.push(`${ await person[`${await p}`] }`);
    }

    expect(properties).toContain('name');
    expect(values).toContain('Ruben Verborgh');
  });

  it('dynamically looking up data on the web with predicates', async () => {
    const person = path.create({ subject: namedNode('https://ruben.verborgh.org/profile/#me') });

    const values = [];
    const predicates = [];
    for await (const p of person.predicates) {
      predicates.push(`${await p}`);
      values.push(`${await person[`${await p}`]}`);
    }

    expect(predicates).toContain('http://xmlns.com/foaf/0.1/name');
    expect(values).toContain('Ruben Verborgh');
  });
});
