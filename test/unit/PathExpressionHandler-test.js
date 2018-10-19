import PathExpressionHandler from '../../src/PathExpressionHandler';

describe('a PathExpressionHandler instance', () => {
  let handler;
  beforeAll(() => handler = new PathExpressionHandler());

  it('errors when an immediate link has no predicate', async () => {
    const parent = {};
    const child = { parent, toString: () => 'child' };

    await expect(handler.execute(child)).rejects
      .toThrow(new Error('Expected predicate in child'));
  });

  it('errors when a root has no subject', async () => {
    const parent = { toString: () => 'root' };
    const child = { parent, predicate: 'foo' };

    await expect(handler.execute(child)).rejects
      .toThrow(new Error('Expected root subject in root'));
  });

  it('resolves a path of length 0', async () => {
    const path = { subject: 'abc' };

    expect(await handler.execute(path)).toEqual([
      { subject: 'abc' },
    ]);
  });

  it('resolves a path of length 1', async () => {
    const path = { subject: 'abc' };
    const first = { parent: path, predicate: 'p1' };

    expect(await handler.execute(first)).toEqual([
      { subject: 'abc' },
      { predicate: 'p1' },
    ]);
  });

  it('resolves a path of length 2', async () => {
    const path = { subject: 'abc' };
    const first = { parent: path, predicate: 'p1' };
    const second = { parent: first, predicate: 'p2' };

    expect(await handler.execute(second)).toEqual([
      { subject: 'abc' },
      { predicate: 'p1' },
      { predicate: 'p2' },
    ]);
  });

  it('resolves a path with promises', async () => {
    const path = { subject: Promise.resolve('abc') };
    const first = { parent: path, predicate: Promise.resolve('p1') };
    const second = { parent: first, predicate: Promise.resolve('p2') };

    expect(await handler.execute(second)).toEqual([
      { subject: 'abc' },
      { predicate: 'p1' },
      { predicate: 'p2' },
    ]);
  });
});
