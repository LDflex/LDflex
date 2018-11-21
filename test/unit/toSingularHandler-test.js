import toSingularHandler from '../../src/toSingularHandler';

describe('toSingularHandler', () => {
  const path = {};
  const proxy = {};
  const iteratorHandler = { execute: jest.fn() };
  let singularHandler;
  beforeAll(() => singularHandler = toSingularHandler(iteratorHandler));

  it('calls execute with path and proxy parameters', async () => {
    singularHandler.execute(path, proxy);
    expect(iteratorHandler.execute).toHaveBeenCalledTimes(1);
    expect(iteratorHandler.execute).toHaveBeenCalledWith(path, proxy);
  });

  it('returns undefined if the inner handler returns undefined', async () => {
    iteratorHandler.execute.mockReturnValueOnce(undefined);
    const value = singularHandler.execute(path, proxy);
    expect(value).toBeUndefined();
  });

  it('returns "abc" if the inner handler returns "abc"', async () => {
    iteratorHandler.execute.mockReturnValueOnce('abc');
    const value = singularHandler.execute(path, proxy);
    expect(value).toBe('abc');
  });

  it('returns a then function to the first value of the iterator', async () => {
    iteratorHandler.execute.mockReturnValueOnce(() => ({
      next: async () => ({ value: 'xyz' }),
    }));
    const promise = { then: singularHandler.execute(path, proxy) };
    return expect(promise).resolves.toBe('xyz');
  });

  it('returns a rejecting then function if the iterator fails', async () => {
    iteratorHandler.execute.mockReturnValueOnce(() => ({
      next: async () => { throw new Error('def'); },
    }));
    const promise = { then: singularHandler.execute(path, proxy) };
    return expect(promise).rejects.toEqual(new Error('def'));
  });
});
