import FallbackHandler from '../../src/FallbackHandler';

describe('a FallbackHandler instance with 0 handlers', () => {
  const path = {};
  const proxy = {};
  let handler, result;
  beforeEach(() => {
    handler = new FallbackHandler();
    result = handler.execute(path, proxy);
  });

  it('returns undefined', () => {
    expect(result).toBeUndefined();
  });
});

describe('a FallbackHandler instance with 1 handler', () => {
  const path = {};
  const proxy = {};
  const handlers = [
    { execute: jest.fn().mockReturnValue('abc') },
  ];
  let handler, result;
  beforeEach(() => {
    handler = new FallbackHandler(handlers);
    result = handler.execute(path, proxy);
  });

  it('calls the first handler with path and proxy', () => {
    expect(handlers[0].execute).toHaveBeenCalledTimes(1);
    expect(handlers[0].execute).toHaveBeenCalledWith(path, proxy);
  });

  it('returns the value of the first handler', () => {
    expect(result).toBe('abc');
  });
});

describe('a FallbackHandler instance with multiple handlers', () => {
  const path = {};
  const proxy = {};
  const handlers = [
    { execute: jest.fn() },
    { execute: jest.fn() },
    { execute: jest.fn().mockReturnValue(null) },
    { execute: jest.fn().mockReturnValue('abc') },
    { execute: jest.fn().mockReturnValue('def') },
  ];
  let handler, result;
  beforeEach(() => {
    handler = new FallbackHandler(handlers);
    result = handler.execute(path, proxy);
  });

  it('calls the first handler with path and proxy', () => {
    expect(handlers[0].execute).toHaveBeenCalledTimes(1);
    expect(handlers[0].execute).toHaveBeenCalledWith(path, proxy);
  });

  it('calls the second handler with path and proxy', () => {
    expect(handlers[1].execute).toHaveBeenCalledTimes(1);
    expect(handlers[1].execute).toHaveBeenCalledWith(path, proxy);
  });

  it('calls the third handler with path and proxy', () => {
    expect(handlers[2].execute).toHaveBeenCalledTimes(1);
    expect(handlers[2].execute).toHaveBeenCalledWith(path, proxy);
  });

  it('does not call the other handlers', () => {
    expect(handlers[3].execute).toHaveBeenCalledTimes(0);
    expect(handlers[4].execute).toHaveBeenCalledTimes(0);
  });

  it('returns the value of the first handler that is not undefined', () => {
    expect(result).toBe(null);
  });
});
