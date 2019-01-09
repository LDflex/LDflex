import ReplaceFunctionHandler from '../../src/ReplaceFunctionHandler';

describe('a ReplaceFunctionHandler instance', () => {
  let handler;
  let proxy;
  beforeAll(() => {
    handler = new ReplaceFunctionHandler();
    proxy = {
      add: jest.fn(() => ({ ...proxy, extended: true })),
      delete: jest.fn(() => ({ ...proxy, extended: true })),
    };
  });

  describe('resolving a property', async () => {
    let result;
    beforeEach(() => result = handler.execute({}, proxy));

    it('returns a function', async () => {
      expect(typeof await result).toEqual('function');
    });

    it('throws when the function is called with zero args', async () => {
      expect(result).toThrow(new Error('Replacing values requires at least two arguments'));
    });

    it('throws when the function is called with one args', async () => {
      expect(() => result('Arg1')).toThrow(new Error('Replacing values requires at least two arguments'));
    });

    describe('with the function called with two args', () => {
      let functionResult;
      beforeEach(async () => functionResult = await result('Arg1', 'Arg2'));

      it('calls delete with 1 arg', () => {
        expect(proxy.delete).toBeCalledTimes(1);
        const args = proxy.delete.mock.calls[0];
        expect(args).toHaveLength(1);
        expect(args[0]).toEqual('Arg1');
      });

      it('calls add with the remaining args', () => {
        expect(proxy.add).toBeCalledTimes(1);
        const args = proxy.add.mock.calls[0];
        expect(args).toHaveLength(1);
        expect(args[0]).toEqual('Arg2');
      });

      it('returns the extended proxy', () => {
        expect(functionResult).toEqual({ ...proxy, extended: true });
      });
    });

    describe('with the function called with three args', () => {
      let functionResult;
      beforeEach(async () => functionResult = await result('Arg1', 'Arg2', 'Arg3'));

      it('calls delete with 1 arg', () => {
        expect(proxy.delete).toBeCalledTimes(1);
        const args = proxy.delete.mock.calls[0];
        expect(args).toHaveLength(1);
        expect(args[0]).toEqual('Arg1');
      });

      it('calls add with the remaining args', () => {
        expect(proxy.add).toBeCalledTimes(1);
        const args = proxy.add.mock.calls[0];
        expect(args).toHaveLength(2);
        expect(args[0]).toEqual('Arg2');
        expect(args[1]).toEqual('Arg3');
      });

      it('returns the extended proxy', () => {
        expect(functionResult).toEqual({ ...proxy, extended: true });
      });
    });
  });
});
