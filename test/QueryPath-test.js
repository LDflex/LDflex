import QueryPath from '../src/QueryPath';

describe('a QueryPath instance without handlers or resolvers', () => {
  let queryPath;
  beforeAll(() => {
    queryPath = new QueryPath();
  });

  describe('when accessing a property', () => {
    it('throws an error', () => {
      expect(() => queryPath.foo).toThrow(
        new Error("Cannot resolve property 'foo'"));
    });
  });
});

describe('a QueryPath instance with two handlers', () => {
  const handlers = {
    foo: {
      execute: jest.fn(() => 'foo'),
    },
    bar: {
      execute: jest.fn(() => 'bar'),
    },
  };

  let queryPath;
  beforeAll(() => {
    queryPath = new QueryPath({ handlers });
  });

  describe('when accessing a property covered by no handlers', () => {
    let error;
    beforeEach(() => {
      try {
        queryPath.other;
      }
      catch (err) {
        error = err;
      }
    });

    it('does not execute the first handler', () => {
      expect(handlers.foo.execute).toBeCalledTimes(0);
    });

    it('does not execute the second handler', () => {
      expect(handlers.bar.execute).toBeCalledTimes(0);
    });

    it('throws an error', () => {
      expect(error).toEqual(new Error("Cannot resolve property 'other'"));
    });
  });

  describe('when accessing the first handler', () => {
    let result;
    beforeEach(() => result = queryPath.foo);

    it('executes the first handler', () => {
      expect(handlers.foo.execute).toBeCalledTimes(1);
    });

    it('does not execute the second handler', () => {
      expect(handlers.bar.execute).toBeCalledTimes(0);
    });

    it('returns the result of the first handler', () => {
      expect(result).toEqual('foo');
    });
  });

  describe('when accessing the second handler', () => {
    let result;
    beforeEach(() => result = queryPath.bar);

    it('does not execute the first handler', () => {
      expect(handlers.foo.execute).toBeCalledTimes(0);
    });

    it('executes the second handler', () => {
      expect(handlers.bar.execute).toBeCalledTimes(1);
    });

    it('returns the result of the second handler', () => {
      expect(result).toEqual('bar');
    });
  });
});

describe('a QueryPath instance with two resolvers', () => {
  const resolvers = [
    {
      supports: jest.fn(prop => prop === 'foo'),
      resolve:  jest.fn((path, prop) => prop.toUpperCase()),
    },
    {
      supports: jest.fn(prop => prop === 'bar'),
      resolve:  jest.fn((path, prop) => prop.toUpperCase()),
    },
  ];

  let queryPath;
  beforeAll(() => {
    queryPath = new QueryPath({ resolvers });
  });

  describe('when accessing a property matched by no resolvers', () => {
    let error;
    beforeEach(() => {
      try {
        queryPath.other;
      }
      catch (err) {
        error = err;
      }
    });

    it('tests the first resolver', () => {
      expect(resolvers[0].supports).toBeCalledTimes(1);
      expect(resolvers[0].supports).toHaveBeenCalledWith('other');
    });

    it('tests the second resolver', () => {
      expect(resolvers[1].supports).toBeCalledTimes(1);
      expect(resolvers[1].supports).toHaveBeenCalledWith('other');
    });

    it('does not use the first resolver', () => {
      expect(resolvers[0].resolve).toBeCalledTimes(0);
    });

    it('does not use the second resolver', () => {
      expect(resolvers[1].resolve).toBeCalledTimes(0);
    });

    it('throws an error', () => {
      expect(error).toEqual(new Error("Cannot resolve property 'other'"));
    });
  });

  describe('when accessing a property matched by the first resolver', () => {
    let result;
    beforeEach(() => result = queryPath.foo);

    it('tests the first resolver', () => {
      expect(resolvers[0].supports).toBeCalledTimes(1);
      expect(resolvers[0].supports).toHaveBeenCalledWith('foo');
    });

    it('does not test the second resolver', () => {
      expect(resolvers[1].supports).toBeCalledTimes(0);
    });

    it('uses the first resolver', () => {
      expect(resolvers[0].resolve).toBeCalledTimes(1);
    });

    it('does not use the second resolver', () => {
      expect(resolvers[1].resolve).toBeCalledTimes(0);
    });

    it('returns the result of the first resolver', () => {
      expect(result).toEqual('FOO');
    });
  });

  describe('when accessing a property matched by the second resolver', () => {
    let result;
    beforeEach(() => result = queryPath.bar);

    it('tests the first resolver', () => {
      expect(resolvers[0].supports).toBeCalledTimes(1);
      expect(resolvers[0].supports).toHaveBeenCalledWith('bar');
    });

    it('does not test the second resolver', () => {
      expect(resolvers[1].supports).toBeCalledTimes(1);
      expect(resolvers[1].supports).toHaveBeenCalledWith('bar');
    });

    it('does not use the first resolver', () => {
      expect(resolvers[0].resolve).toBeCalledTimes(0);
    });

    it('uses the second resolver', () => {
      expect(resolvers[1].resolve).toBeCalledTimes(1);
    });

    it('returns the result of the second resolver', () => {
      expect(result).toEqual('BAR');
    });
  });
});

describe('a QueryPath instance with a handler and a resolver', () => {
  const handlers = {
    foo: {
      execute: jest.fn(() => 'foo'),
    },
  };
  const resolvers = [
    {
      supports: jest.fn(prop => prop === 'foo'),
      resolve:  jest.fn((path, prop) => prop.toUpperCase()),
    },
  ];

  let queryPath;
  beforeAll(() => {
    queryPath = new QueryPath({ handlers, resolvers });
  });

  describe('when accessing a property matched by no resolvers', () => {
    let error;
    beforeEach(() => {
      try {
        queryPath.other;
      }
      catch (err) {
        error = err;
      }
    });

    it('does not execute the handler', () => {
      expect(handlers.foo.execute).toBeCalledTimes(0);
    });

    it('tests the resolver', () => {
      expect(resolvers[0].supports).toBeCalledTimes(1);
      expect(resolvers[0].supports).toHaveBeenCalledWith('other');
    });

    it('does not use the resolver', () => {
      expect(resolvers[0].resolve).toBeCalledTimes(0);
    });

    it('throws an error', () => {
      expect(error).toEqual(new Error("Cannot resolve property 'other'"));
    });
  });

  describe('when accessing a property matched by both', () => {
    let result;
    beforeEach(() => result = queryPath.foo);

    it('executes the handler', () => {
      expect(handlers.foo.execute).toBeCalledTimes(1);
    });

    it('does not test the resolver', () => {
      expect(resolvers[0].supports).toBeCalledTimes(0);
    });

    it('does not use the resolver', () => {
      expect(resolvers[0].resolve).toBeCalledTimes(0);
    });

    it('returns the result of the handler', () => {
      expect(result).toEqual('foo');
    });
  });
});
