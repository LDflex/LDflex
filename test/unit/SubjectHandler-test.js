import SubjectHandler from '../../src/SubjectHandler';
import { namedNode } from '@rdfjs/data-model';

describe('a SubjectHandler instance', () => {
  let handler;
  beforeAll(() => handler = new SubjectHandler());

  it('returns undefined if no subject is set', () => {
    expect(handler.execute({})).toBeUndefined();
  });

  it('returns a subject named node as a promise', () => {
    const subject = namedNode('abc');
    return expect(handler.execute({ subject }, subject)).resolves.toEqual(namedNode('abc'));
  });

  it('returns a subject promise', () => {
    const subject = Promise.resolve(namedNode('abc'));
    return expect(handler.execute({ subject }, subject)).resolves.toEqual(namedNode('abc'));
  });
});
