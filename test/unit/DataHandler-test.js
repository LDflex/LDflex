import DataHandler from '../../src/DataHandler';

const dataSync = {
  a: {
    b: {
      c: 'd',
    },
  },
};
const dataAsync = {
  a: Promise.resolve({
    b: Promise.resolve({
      c: Promise.resolve('d'),
    }),
  }),
};
const dataEmpty = {};

describe('a DataHandler instance', () => {
  describe('that is synchronous', () => {
    let handler;
    beforeAll(() => {
      handler = DataHandler.sync('a', 'b', 'c');
    });

    it('returns the existing path value on synchronous data', () => {
      expect(handler.handle(dataSync)).toEqual('d');
    });

    it('returns undefined on asynchronous data', () => {
      expect(handler.handle(dataAsync)).toBeUndefined();
    });

    it('returns undefined for a non-existing path value', () => {
      expect(handler.handle(dataEmpty)).toBeUndefined();
    });
  });

  describe('that is asynchronous', () => {
    let handler;
    beforeAll(() => {
      handler = DataHandler.async('a', 'b', 'c');
    });

    it('returns the existing path value on synchronous data', async () => {
      await expect(handler.handle(dataSync)).resolves.toEqual('d');
    });

    it('returns the existing path value on asynchronous data', async () => {
      await expect(handler.handle(dataAsync)).resolves.toEqual('d');
    });

    it('returns undefined for a non-existing path value', async () => {
      await expect(handler.handle(dataEmpty)).resolves.toBeUndefined();
    });
  });

  describe('that is synchronous behind a function', () => {
    let handler;
    beforeAll(() => {
      handler = DataHandler.syncFunction('a', 'b', 'c');
    });

    it('returns the existing path value on synchronous data', () => {
      expect(handler.handle(dataSync)()).toEqual('d');
    });

    it('returns undefined on asynchronous data', () => {
      expect(handler.handle(dataAsync)()).toBeUndefined();
    });

    it('returns undefined for a non-existing path value', () => {
      expect(handler.handle(dataEmpty)()).toBeUndefined();
    });
  });

  describe('that is asynchronous behind a function', () => {
    let handler;
    beforeAll(() => {
      handler = DataHandler.asyncFunction('a', 'b', 'c');
    });

    it('returns the existing path value on synchronous data', async () => {
      await expect(handler.handle(dataSync)()).resolves.toEqual('d');
    });

    it('returns the existing path value on asynchronous data', async () => {
      await expect(handler.handle(dataAsync)()).resolves.toEqual('d');
    });

    it('returns undefined for a non-existing path value', async () => {
      await expect(handler.handle(dataEmpty)()).resolves.toBeUndefined();
    });
  });
});
