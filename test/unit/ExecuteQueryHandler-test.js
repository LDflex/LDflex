import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';

describe('a ExecuteQueryHandler instance', () => {
  let handler;
  beforeAll(() => handler = new ExecuteQueryHandler());

  it('errors when a path defines no query engine', () => {
    const path = { settings: {}, toString: () => 'path' };
    expect(() => handler.execute(path))
      .toThrow(new Error('No query engine defined in path'));
  });
});
