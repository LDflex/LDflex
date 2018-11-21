import PathFactory from '../../src/PathFactory';
import context from '../context';
import { createQueryEngine } from '../util';

const subject = 'https://example.org/#me';
const queryEngine = createQueryEngine(['Alice', 'Bob', 'Carol']);

describe('a PathFactory instance', () => {
  const factory = new PathFactory({ context, queryEngine });

  let person;
  beforeAll(() => {
    person = factory.create({ subject });
  });

  it('returns results for a path with 3 links', async () => {
    const names = [];
    for await (const firstName of person.friends.firstName)
      names.push(firstName);
    expect(names.map(n => `${n}`)).toEqual(['Alice', 'Bob', 'Carol']);
  });

  it('returns the first result for a path with 3 links', async () => {
    const name = await person.friends.firstName;
    expect(`${name}`).toBe('Alice');
  });
});
