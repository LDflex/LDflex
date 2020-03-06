import GetFunctionHandler from '../../src/GetFunctionHandler';

describe('a PathExpressionHandler instance', () => {
  let handler;
  let proxy;
  let fn;
  beforeAll(() => {
    handler = new GetFunctionHandler();
    proxy = {
      get: jest.fn(async (...args) => args.map(arg => proxy[arg])),
      Arg1: ({ subject: 'http://Arg1' }),
      Arg2: ({ subject: 'http://Arg2' }),
    };
    fn = handler.handle(null, proxy);
  });

  it('supports an empty array', async () => {
    await expect(fn()).resolves.toEqual([]);
  });

  it('supports a two-element array', async () => {
    await expect(fn(['Arg1', 'Arg2'])).resolves.toEqual([
      { subject: 'http://Arg1' },
      { subject: 'http://Arg2' },
    ]);
  });

  it('supports a property', async () => {
    await expect(fn('Arg1')).resolves.toEqual([
      { subject: 'http://Arg1' },
    ]);
  });

  it('supports two properties', async () => {
    await expect(fn('Arg1', 'Arg2')).resolves.toEqual([
      { subject: 'http://Arg1' },
      { subject: 'http://Arg2' },
    ]);
  });


  it('supports an object with falsy keys', async () => {
    await expect(fn({ Arg1: null, Arg2: false })).resolves.toEqual({
      Arg1: { subject: 'http://Arg1' },
      Arg2: { subject: 'http://Arg2' },
    });
  });

  it('supports an object with string keys', async () => {
    await expect(fn({ a: 'Arg1', b: 'Arg2' })).resolves.toEqual({
      a: { subject: 'http://Arg1' },
      b: { subject: 'http://Arg2' },
    });
  });

  it('supports an object with complex keys', async () => {
    const result = fn({
      a: ['Arg1', 'Arg2'],
      b: { a: 'Arg1', b: 'Arg2' },
    });
    await expect(result).resolves.toEqual({
      a: [
        { subject: 'http://Arg1' },
        { subject: 'http://Arg2' },
      ],
      b: {
        a: { subject: 'http://Arg1' },
        b: { subject: 'http://Arg2' },
      },
    });
  });

  it('support an asynchronously iterable', async () => {
    async function* properties() {
      yield 'Arg1';
      yield 'Arg2';
    }
    await expect(fn(properties())).resolves.toEqual([
      { subject: 'http://Arg1' },
      { subject: 'http://Arg2' },
    ]);
  });

  it('supports a complex array', async () => {
    const result = fn(
      ['Arg1', 'Arg2', ['Arg1']],
      'Arg2',
      { Arg1: null, Arg2: false },
    );
    await expect(result).resolves.toEqual([
      [
        { subject: 'http://Arg1' },
        { subject: 'http://Arg2' },
        [{ subject: 'http://Arg1' }],
      ],
      { subject: 'http://Arg2' },
      {
        Arg1: { subject: 'http://Arg1' },
        Arg2: { subject: 'http://Arg2' },
      },
    ]);
  });
});
