import PathExpressionHandler from '../../src/PathExpressionHandler';
import * as dataFactory from '@rdfjs/data-model';

describe('a PathExpressionHandler instance', () => {
  let handler;
  beforeAll(() => handler = new PathExpressionHandler());

  it('ignores an immediate link has no predicate', async () => {
    const parent = { subject: dataFactory.namedNode('abc') };
    const child = { parent, toString: () => 'child' };

    expect(await handler.execute(child)).toEqual([
      { subject: dataFactory.namedNode('abc') },
    ]);
  });

  it('errors when a root has no subject', async () => {
    const parent = { toString: () => 'root' };
    const child = { parent, predicate: dataFactory.namedNode('foo') };

    await expect(handler.execute(child)).rejects
      .toThrow(new Error('Expected root subject in root'));
  });

  it('resolves a path of length 0', async () => {
    const path = { subject: dataFactory.namedNode('abc') };

    expect(await handler.execute(path)).toEqual([
      { subject: dataFactory.namedNode('abc') },
    ]);
  });

  it('resolves a path of length 1', async () => {
    const path = { subject: dataFactory.namedNode('abc') };
    const first = { parent: path, predicate: dataFactory.namedNode('p1') };

    expect(await handler.execute(first)).toEqual([
      { subject: dataFactory.namedNode('abc') },
      { predicate: dataFactory.namedNode('p1') },
    ]);
  });

  it('resolves a path of length 2', async () => {
    const path = { subject: dataFactory.namedNode('abc') };
    const first = { parent: path, predicate: dataFactory.namedNode('p1') };
    const second = { parent: first, predicate: dataFactory.namedNode('p2') };

    expect(await handler.execute(second)).toEqual([
      { subject: dataFactory.namedNode('abc') },
      { predicate: dataFactory.namedNode('p1') },
      { predicate: dataFactory.namedNode('p2') },
    ]);
  });

  it('resolves a path with promises', async () => {
    const path = { subject: Promise.resolve(dataFactory.namedNode('abc')) };
    const first = { parent: path, predicate: Promise.resolve(dataFactory.namedNode('p1')) };
    const second = { parent: first, predicate: Promise.resolve(dataFactory.namedNode('p2')) };

    expect(await handler.execute(second)).toEqual([
      { subject: dataFactory.namedNode('abc') },
      { predicate: dataFactory.namedNode('p1') },
      { predicate: dataFactory.namedNode('p2') },
    ]);
  });
});
