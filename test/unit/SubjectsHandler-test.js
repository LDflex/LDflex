import SubjectsHandler from '../../src/SubjectsHandler';

function toString() {
  return 'path';
}

describe('a SubjectsHandler instance', () => {
  let handler;
  beforeAll(() => handler = new SubjectsHandler());

  it('errors when a path defines no query engine', async () => {
    const path = { settings: {}, toString };
    const iterable = handler.handle(path, {});
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).rejects
      .toThrow(new Error('path has no queryEngine setting'));
  });
});
