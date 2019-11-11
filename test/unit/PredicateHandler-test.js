import PredicateHandler from '../../src/PredicateHandler';

describe('a PredicateHandler instance', () => {
  let handler;
  const newPath = {};
  const extendPath = jest.fn(() => newPath);
  beforeAll(() => handler = new PredicateHandler());

  describe('when no predicate property is present', () => {
    const pathData = {};
    let result;
    beforeEach(() => (result = handler.handle(pathData)));

    it('returns undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when a predicate property is present', () => {
    const predicate = {};
    const pathData = { predicate: Promise.resolve(predicate), extendPath };
    let result;
    beforeEach(() => (result = handler.handle(pathData)));

    it('returns a new path with the predicate as subject', async () => {
      expect(pathData.extendPath).toHaveBeenCalledTimes(1);
      expect(pathData.extendPath).toHaveBeenCalledWith({ subject: predicate }, null);
      await expect(result).resolves.toBe(newPath);
    });
  });
});
