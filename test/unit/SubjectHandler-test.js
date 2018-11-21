import SubjectHandler from '../../src/SubjectHandler';

describe('a SubjectHandler instance', () => {
  let handler;
  beforeAll(() => handler = new SubjectHandler());

  it('returns undefined if no subject is set', () => {
    expect(handler.execute({})).toBeUndefined();
  });

  it('returns a subject string', async () => {
    const subject = 'abc';
    const iterable = {
      [Symbol.asyncIterator]: handler.execute({ subject }),
    };
    const values = [];
    for await (const value of iterable)
      values.push(value);
    expect(values).toEqual(['abc']);
  });

  it('returns a subject promise', async () => {
    const subject = Promise.resolve('abc');
    const iterable = {
      [Symbol.asyncIterator]: handler.execute({ subject }),
    };
    const values = [];
    for await (const value of iterable)
      values.push(value);
    expect(values).toEqual(['abc']);
  });
});
