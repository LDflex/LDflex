import SortHandler from '../../src/SortHandler';

describe('a SortHandler instance', () => {
  let handler;
  const dummyData = { p1: { p2: 'done' } };
  const extendPath = jest.fn(data => ({ ...data, ...dummyData }));
  beforeAll(() => handler = new SortHandler());

  describe('creates a function that', () => {
    it('is a function', () => {
      expect(handler.handle({})).toBeInstanceOf(Function);
    });

    it('errors if called after a previous sort', () => {
      expect(handler.handle({ sort: 'DESC' })).toThrow('Multiple sorts not supported');
    });

    it('creates a path entry with child data', () => {
      expect(handler.handle({ extendPath })()).toEqual({ ...dummyData, childData: { count: 0, data: { sort: 'ASC' } } });
    });

    it('calls the proxy with the given parameters', () => {
      expect(handler.handle({ extendPath })('p1', 'p2')).toEqual('done');
    });
  });
});
