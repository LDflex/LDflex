import SubjectHandler from '../../src/SubjectHandler';

describe('a SubjectHandler instance', () => {
  let handler;
  beforeAll(() => handler = new SubjectHandler());

  it('returns undefined if no subject is set', () => {
    expect(handler.execute({})).toBeUndefined();
  });

  it('returns a subject string as a promise', () => {
    const subject = 'abc';
    return expect(handler.execute({ subject })).resolves.toBe('abc');
  });

  it('returns a subject promise', () => {
    const subject = Promise.resolve('abc');
    return expect(handler.execute({ subject })).resolves.toBe('abc');
  });
});
