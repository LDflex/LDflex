import GetFunctionHandler from '../../src/GetFunctionHandler';


describe('a PathExpressionHandler instance', () => {
  let handler;
  let proxy;
  let result;
  beforeAll(() => {
    handler = new GetFunctionHandler();
    proxy = {
      get: jest.fn(async (...args) => args.map(arg => proxy[arg])),
      Arg1: ({ subject: 'http://Arg1' }),
      Arg2: ({ subject: 'http://Arg2' }),
    };
    result = handler.handle(null, proxy);
  });

  it('throws an error if no arguments were provided', async () => {
    await expect(result()).rejects.toThrow();
  });

  it('recursively calls the get function if the input was an array', () => {
    result(['Arg1', 'Arg2']);
    expect(proxy.get).toBeCalledTimes(1);
    const args = proxy.get.mock.calls[0];
    expect(args).toEqual(['Arg1', 'Arg2']);
  });

  it('returns an object with results if the input was an object', async () => {
    const funcResult = await result({ Arg1: null, Arg2: null });
    expect(proxy.get).toBeCalledTimes(1);
    const args = proxy.get.mock.calls[0];
    expect(args).toEqual(['Arg1', 'Arg2']);
    expect(funcResult).toEqual({ Arg1: { subject: 'http://Arg1' }, Arg2: { subject: 'http://Arg2' } });
  });

  it('returns an array of results if non-collection parameters were provided', async () => {
    const funcResult = await result('Arg1', 'Arg2');
    expect(funcResult).toEqual([{ subject: 'http://Arg1' }, { subject: 'http://Arg2' }]);
  });

  it('recognizes when a single argument is not a collection', async () => {
    const funcResult = await result('Arg1');
    expect(funcResult).toEqual([{ subject: 'http://Arg1' }]);
  });

  it('returns an asynciterator of results if the parmater was an asynciterator', async () => {
    async function* arg() {
      yield 'Arg1';
      yield 'Arg2';
    }
    const funcResult = await result(arg());
    expect((await funcResult.next()).value).toEqual({ subject: 'http://Arg1' });
    expect((await funcResult.next()).value).toEqual({ subject: 'http://Arg2' });
    expect(await funcResult.next()).toEqual({ done: true });
  });
});
