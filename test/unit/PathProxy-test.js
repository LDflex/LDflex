import PathProxy from '../../src/PathProxy';

describe('a PathProxy without handlers or resolvers', () => {
  let pathProxy;
  beforeAll(() => (pathProxy = new PathProxy()));

  describe('a created path', () => {
    let path;
    beforeAll(() => (path = pathProxy.createPath()));

    describe('when accessing a string property', () => {
      it('returns undefined', () => {
        expect(path.foo).toBeUndefined();
      });
    });

    describe('when accessing a symbol property', () => {
      it('returns undefined', () => {
        expect(path[Symbol('symbol')]).toBeUndefined();
      });
    });
  });
});

describe('a PathProxy with two handlers', () => {
  const handlers = {
    foo: {
      handle: jest.fn(() => 'foo'),
    },
    bar: {
      handle: jest.fn(() => 'bar'),
    },
  };
  let pathProxy;
  beforeAll(() => (pathProxy = new PathProxy({ handlers })));

  describe('a created path', () => {
    let path;
    beforeAll(() => (path = pathProxy.createPath()));

    describe('when accessing a property covered by no handlers', () => {
      let result;
      beforeEach(() => result = path.other);

      it('does not execute the first handler', () => {
        expect(handlers.foo.handle).toBeCalledTimes(0);
      });

      it('does not execute the second handler', () => {
        expect(handlers.bar.handle).toBeCalledTimes(0);
      });

      it('returns undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when accessing the first handler', () => {
      let result;
      beforeEach(() => result = path.foo);

      it('executes the first handler', () => {
        expect(handlers.foo.handle).toBeCalledTimes(1);
        const [data, proxy] = handlers.foo.handle.mock.calls[0];
        expect(data).toHaveProperty('settings');
        expect(proxy).toBe(data.proxy);
      });

      it('does not execute the second handler', () => {
        expect(handlers.bar.handle).toBeCalledTimes(0);
      });

      it('returns the result of the first handler', () => {
        expect(result).toEqual('foo');
      });
    });

    describe('when accessing the second handler', () => {
      let result;
      beforeEach(() => result = path.bar);

      it('does not execute the first handler', () => {
        expect(handlers.foo.handle).toBeCalledTimes(0);
      });

      it('executes the second handler', () => {
        expect(handlers.bar.handle).toBeCalledTimes(1);
        const [data, proxy] = handlers.bar.handle.mock.calls[0];
        expect(data).toHaveProperty('settings');
        expect(proxy).toBe(data.proxy);
      });

      it('returns the result of the second handler', () => {
        expect(result).toEqual('bar');
      });
    });
  });
});

describe('a PathProxy with two resolvers', () => {
  const resolvers = [
    {
      supports: jest.fn(prop => prop === 'foo'),
      resolve:  jest.fn(prop => prop.toUpperCase()),
    },
    {
      supports: jest.fn(prop => prop === 'bar'),
      resolve:  jest.fn(prop => prop.toUpperCase()),
    },
  ];
  let pathProxy;
  beforeAll(() => (pathProxy = new PathProxy({ resolvers })));

  describe('a created path', () => {
    let path;
    beforeAll(() => (path = pathProxy.createPath()));

    describe('when accessing a property matched by no resolvers', () => {
      let result;
      beforeEach(() => result = path.other);

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

      it('returns undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when accessing a property matched by the first resolver', () => {
      let result;
      beforeEach(() => result = path.foo);

      it('tests the first resolver', () => {
        expect(resolvers[0].supports).toBeCalledTimes(1);
        expect(resolvers[0].supports).toHaveBeenCalledWith('foo');
      });

      it('does not test the second resolver', () => {
        expect(resolvers[1].supports).toBeCalledTimes(0);
      });

      it('uses the first resolver', () => {
        expect(resolvers[0].resolve).toBeCalledTimes(1);
        const [property, data, proxy] = resolvers[0].resolve.mock.calls[0];
        expect(property).toBe('foo');
        expect(data).toHaveProperty('settings');
        expect(proxy).toBe(data.proxy);
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
      beforeEach(() => result = path.bar);

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
        const [property, data, proxy] = resolvers[1].resolve.mock.calls[0];
        expect(property).toBe('bar');
        expect(data).toHaveProperty('settings');
        expect(proxy).toBe(data.proxy);
      });

      it('returns the result of the second resolver', () => {
        expect(result).toEqual('BAR');
      });
    });
  });
});

describe('a PathProxy with a handler and a resolver', () => {
  const handlers = {
    foo: {
      handle: jest.fn(() => 'foo'),
    },
  };
  const resolvers = [
    {
      supports: jest.fn(prop => prop === 'foo'),
      resolve:  jest.fn((path, prop) => prop.toUpperCase()),
    },
  ];
  let pathProxy;
  beforeAll(() => (pathProxy = new PathProxy({ handlers, resolvers })));

  describe('a created path', () => {
    let path;
    beforeAll(() => (path = pathProxy.createPath()));

    describe('when accessing a property matched by no resolvers', () => {
      let result;
      beforeEach(() => result = path.other);

      it('does not execute the handler', () => {
        expect(handlers.foo.handle).toBeCalledTimes(0);
      });

      it('tests the resolver', () => {
        expect(resolvers[0].supports).toBeCalledTimes(1);
        expect(resolvers[0].supports).toHaveBeenCalledWith('other');
      });

      it('does not use the resolver', () => {
        expect(resolvers[0].resolve).toBeCalledTimes(0);
      });

      it('returns undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when accessing a property matched by both', () => {
      let result;
      beforeEach(() => result = path.foo);

      it('executes the handler', () => {
        expect(handlers.foo.handle).toBeCalledTimes(1);
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
});

describe('a PathProxy whose paths are extended', () => {
  const handlers = {
    internal: {
      handle: pathProxy => pathProxy,
    },
  };
  const initialData = { a: 1 };
  const settings = {};
  let pathProxy, path;
  beforeAll(() => {
    pathProxy = new PathProxy({ handlers });
    path = pathProxy.createPath(settings, initialData);
  });

  describe('the original path', () => {
    it('does not proxy the initial data', () => {
      expect(path.a).toBeUndefined();
    });

    it('contains a copy of the initial data', () => {
      expect(path.internal).toHaveProperty('a', 1);
      expect(path.internal).not.toBe(initialData);
    });

    it('contains a reference to the settings', () => {
      expect(path.internal).toHaveProperty('settings');
      expect(path.internal.settings).toBe(settings);
    });
  });

  describe('the extended path', () => {
    const extendedData = { b: 2 };
    let extendedPath;
    beforeAll(() => {
      extendedPath = path.internal.extendPath(extendedData);
    });

    it('has the same handlers as the original path', () => {
      expect(extendedPath.internal).toBeTruthy();
    });

    it('does not contain a copy of the original data', () => {
      expect(extendedPath.internal).not.toHaveProperty('a', 1);
    });

    it('contains a copy of the extended data', () => {
      expect(extendedPath.internal).toHaveProperty('b', 2);
      expect(extendedPath.internal).not.toBe(extendedData);
    });

    it('does not contain a copy of the initial data', () => {
      expect(extendedPath.internal).not.toHaveProperty('a');
    });

    it('contains a parent field with the original path', () => {
      expect(extendedPath.internal)
        .toHaveProperty('parent', path.internal);
    });

    it('contains a reference to the settings', () => {
      expect(path.internal).toHaveProperty('settings');
      expect(path.internal.settings).toBe(settings);
    });
  });
});
