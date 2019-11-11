import SortHandler from '../../src/SortHandler';

describe('a SortHandler instance', () => {
  const path = {
    p1: { predicate: 'http://p.example/#1' },
    p2: { predicate: 'http://p.example/#2' },
  };
  const pathData = {
    extendPath: jest.fn(data => ({ ...data, ...path })),
  };

  let handler;
  beforeAll(() => handler = new SortHandler());

  describe('returns a function that', () => {
    let sort;
    beforeAll(() => {
      sort = handler.handle(pathData, path);
      path.sort = sort;
    });

    it('returns the original path when called without arguments', () => {
      expect(sort()).toBe(path);
    });

    it('returns a sort path when called with one property', () => {
      const sortedPath = sort('p1');
      expect(pathData.extendPath).toHaveBeenCalledTimes(1);
      expect(pathData.extendPath).toHaveBeenCalledWith({
        property: 'p1',
        predicate: 'http://p.example/#1',
        sort: 'ASC',
      });
      expect(sortedPath).toBe(pathData.extendPath.mock.results[0].value);
    });

    it('returns a sort path when called with two properties', () => {
      const sortedPath = sort('p1', 'p2');
      expect(pathData.extendPath).toHaveBeenCalledTimes(2);
      expect(pathData.extendPath).toHaveBeenCalledWith({
        property: 'p1',
        predicate: 'http://p.example/#1',
        sort: 'ASC',
      });
      expect(pathData.extendPath).toHaveBeenCalledWith({
        property: 'p2',
        predicate: 'http://p.example/#2',
        sort: 'ASC',
      });
      expect(sortedPath).toBe(pathData.extendPath.mock.results[1].value);
      expect(sortedPath).toEqual(path.sort('p1').sort('p2'));
    });
  });
});
