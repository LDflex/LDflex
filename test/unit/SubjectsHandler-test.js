import SubjectsHandler from '../../src/SubjectsHandler';
import { literal } from '@rdfjs/data-model';
import { createQueryEngine } from '../util';

const queryEngine = createQueryEngine([
  literal('Alex'),
  literal('Barbara'),
  literal('Cameron'),
]);

describe('a SubjectsHandler instance', () => {
  let handler;
  beforeAll(() => handler = new SubjectsHandler());

  it('errors when a path defines no query engine', async () => {
    const path = { settings: {}, toString: () => 'path' };
    const iterable = handler.handle(path);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).rejects
      .toThrow(new Error('path has no queryEngine setting'));
  });

  it('returns results, with executeQuery being called with the right query', async () => {
    const extendPath = {};
    const path = {
      settings: { queryEngine },
      extendPath: jest.fn(() => extendPath),
      toString: () => 'path',
    };
    const iterable = handler.handle(path);
    const results = [];
    for await (const result of iterable)
      results.push(result);
    expect(queryEngine.execute).toBeCalledWith('SELECT distinct ?s WHERE { ?s ?p ?o }');
    expect(path.extendPath.mock.calls).toHaveLength(3);
    expect(results).toHaveLength(3);
  });
});
