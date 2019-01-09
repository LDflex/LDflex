import SetFunctionHandler from '../../src/SetFunctionHandler';

describe('a SetFunctionHandler instance', () => {
  let handler;
  let proxy;
  beforeAll(() => {
    handler = new SetFunctionHandler();
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

    describe('with the function called', () => {
      let functionResult;
      beforeEach(async () => functionResult = await result('Arg1', 'Arg2'));

      it('calls delete with 0 args', () => {
        expect(proxy.delete).toBeCalledTimes(1);
        const args = proxy.delete.mock.calls[0];
        expect(args).toHaveLength(0);
      });

      it('calls add with the original args', () => {
        expect(proxy.add).toBeCalledTimes(1);
        const args = proxy.add.mock.calls[0];
        expect(args).toHaveLength(2);
        expect(args[0]).toEqual('Arg1');
        expect(args[1]).toEqual('Arg2');
      });

      it('returns the extended proxy', () => {
        expect(functionResult).toEqual({ ...proxy, extended: true });
      });
    });
  });
});
