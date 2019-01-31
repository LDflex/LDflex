import PathExpressionHandler from '../../src/PathExpressionHandler';
import { namedNode } from '@rdfjs/data-model';

describe('a PathExpressionHandler instance', () => {
  let handler;
  beforeAll(() => handler = new PathExpressionHandler());

  it('ignores an immediate link has no predicate', async () => {
    const parent = { subject: namedNode('abc') };
    const child = { parent, toString: () => 'child' };

    expect(await handler.handle(child)).toEqual([
      { subject: namedNode('abc') },
    ]);
  });

  it('errors when a root has no subject', async () => {
    const parent = { toString: () => 'root' };
    const child = { parent, predicate: namedNode('foo') };

    await expect(handler.handle(child)).rejects
      .toThrow(new Error('Expected root subject in root'));
  });

  it('resolves a path of length 0', async () => {
    const pathData = { subject: namedNode('abc') };

    expect(await handler.handle(pathData)).toEqual([
      { subject: namedNode('abc') },
    ]);
  });

  it('resolves a path of length 1', async () => {
    const pathData = { subject: namedNode('abc') };
    const first = { parent: pathData, predicate: namedNode('p1') };

    expect(await handler.handle(first)).toEqual([
      { subject: namedNode('abc') },
      { predicate: namedNode('p1') },
    ]);
  });

  it('resolves a path of length 2', async () => {
    const pathData = { subject: namedNode('abc') };
    const first = { parent: pathData, predicate: namedNode('p1') };
    const second = { parent: first, predicate: namedNode('p2') };

    expect(await handler.handle(second)).toEqual([
      { subject: namedNode('abc') },
      { predicate: namedNode('p1') },
      { predicate: namedNode('p2') },
    ]);
  });

  it('resolves a path with promises', async () => {
    const pathData = { subject: Promise.resolve(namedNode('abc')) };
    const first = { parent: pathData, predicate: Promise.resolve(namedNode('p1')) };
    const second = { parent: first, predicate: Promise.resolve(namedNode('p2')) };

    expect(await handler.handle(second)).toEqual([
      { subject: namedNode('abc') },
      { predicate: namedNode('p1') },
      { predicate: namedNode('p2') },
    ]);
  });
});
