import PathFactory from '../../src/PathFactory';
import context from '../context';
import { createQueryEngine } from '../util';
import { namedNode, literal } from '@rdfjs/data-model';

const subject = namedNode('https://example.org/#me');
const queryEngine = createQueryEngine([
  literal('Alice'),
  literal('Bob'),
  literal('Carol'),
]);

describe('a PathFactory instance', () => {
  const factory = new PathFactory({ context, queryEngine });

  let person;
  beforeAll(() => {
    person = factory.create({ subject });
  });

  it('returns results for a path with 1 link', async () => {
    const names = [];
    for await (const firstName of person)
      names.push(firstName);
    expect(names.map(n => `${n}`)).toEqual(['https://example.org/#me']);
  });

  it('returns the first result for a path with 1 link', async () => {
    const name = await person;
    expect(`${name}`).toBe('https://example.org/#me');
  });

  it('returns results for a path with 3 links', async () => {
    const names = [];
    for await (const firstName of person.friends.firstName)
      names.push(firstName);
    expect(names.map(n => `${n}`)).toEqual(['Alice', 'Bob', 'Carol']);
  });

  describe('the first result for a path with 3 links', () => {
    let name;

    beforeEach(async () => name = await person.friends.firstName);

    it('has the correct value', async () => {
      expect(`${name}`).toBe('Alice');
    });

    it('is an RDFJS term', async () => {
      expect(name.termType).toBe('Literal');
      expect(name.value).toBe('Alice');
      expect(name.equals).toBeInstanceOf(Function);
      expect(name.equals(literal('Alice'))).toBeTruthy();
      expect(name.equals(literal('Bob'))).toBeFalsy();
      expect(name.language).toBe('');
      expect(name.datatype).toEqual(namedNode('http://www.w3.org/2001/XMLSchema#string'));
    });
  });
});
