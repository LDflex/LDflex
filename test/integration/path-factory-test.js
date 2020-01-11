import PathFactory from '../../src/PathFactory';
import context from '../context';
import { createQueryEngine } from '../util';
import { namedNode, literal } from '@rdfjs/data-model';

const subject = namedNode('https://example.org/#me');

describe('a PathFactory instance returning non-empty results', () => {
  const queryEngine = createQueryEngine([
    literal('Alice'),
    literal('Bob'),
    literal('Carol'),
  ]);
  const factory = new PathFactory({ context, queryEngine });

  let person;
  beforeAll(() => {
    person = factory.create({ subject });
  });

  describe('for a path with 1 link', () => {
    it('resolves to the first result', async () => {
      expect(`${await person}`)
        .toBe('https://example.org/#me');
    });

    it('returns the first value', async () => {
      expect(await person.value)
        .toBe('https://example.org/#me');
    });

    it('returns an array of values', async () => {
      expect(await person.values)
        .toEqual(['https://example.org/#me']);
    });
  });

  describe('for a path with 3 links', () => {
    it('resolves to the first value', async () => {
      expect(`${await person.friends.firstName}`)
        .toBe('Alice');
    });

    it('returns the first value', async () => {
      expect(await person.friends.firstName.value)
        .toBe('Alice');
    });

    it('returns the first termType', async () => {
      expect(await person.friends.firstName.termType)
        .toBe('Literal');
    });

    it('returns an array of values', async () => {
      expect(await person.friends.firstName.values)
        .toEqual(['Alice', 'Bob', 'Carol']);
    });

    it('returns an array of termTypes', async () => {
      expect(await person.friends.firstName.termTypes)
        .toEqual(['Literal', 'Literal', 'Literal']);
    });

    describe('the first result', () => {
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
});

describe('a PathFactory instance returning empty results', () => {
  const queryEngine = createQueryEngine([]);
  const factory = new PathFactory({ context, queryEngine });

  let person;
  beforeAll(() => {
    person = factory.create({ subject });
  });

  describe('for a path with 1 link', () => {
    it('resolves to the first result', async () => {
      expect(`${await person}`)
        .toBe('https://example.org/#me');
    });

    it('returns the first value', async () => {
      expect(await person.value)
        .toBe('https://example.org/#me');
    });

    it('returns an array of values', async () => {
      expect(await person.values)
        .toEqual(['https://example.org/#me']);
    });
  });

  describe('for a path with 3 links', () => {
    it('resolves to undefined', async () => {
      expect(await person.friends.firstName)
        .toBeUndefined();
    });

    it('returns undefined as value', async () => {
      expect(await person.friends.firstName.value)
        .toBeUndefined();
    });

    it('returns undefined as termType', async () => {
      expect(await person.friends.firstName.termType)
        .toBeUndefined();
    });

    it('returns an empty array of values', async () => {
      expect(await person.friends.firstName.values)
        .toEqual([]);
    });
  });
});
