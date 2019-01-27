import SubjectHandler from '../../src/SubjectHandler';

describe('a SubjectHandler instance', () => {
  let handler;
  const newPath = {};
  const extend = jest.fn(() => newPath);
  beforeAll(() => handler = new SubjectHandler());

  describe('when no subject or parent property is present', () => {
    const pathData = { extend };
    let result;
    beforeEach(() => (result = handler.execute(pathData)));

    it('returns undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when subject is an object', () => {
    const subject = {};
    const pathData = { subject, extend };
    let result;
    beforeEach(() => (result = handler.execute(pathData)));

    it('returns a new path with the subject', async () => {
      expect(pathData.extend).toHaveBeenCalledTimes(1);
      expect(pathData.extend).toHaveBeenCalledWith({ subject }, null);
      await expect(result).resolves.toEqual(newPath);
    });
  });

  describe('when subject is a promise to an object', () => {
    const subject = {};
    const pathData = { subject: Promise.resolve(subject), extend };
    let result;
    beforeEach(() => (result = handler.execute(pathData)));

    it('returns a new path with the resolved subject', async () => {
      expect(pathData.extend).toHaveBeenCalledTimes(1);
      expect(pathData.extend).toHaveBeenCalledWith({ subject }, null);
      await expect(result).resolves.toEqual(newPath);
    });
  });

  describe('when there is a parent path to a subject', () => {
    const subject = {};
    const pathData = {
      parent: {
        parent: {
          parent: { subject },
        },
      },
      extend,
    };
    let result;
    beforeEach(() => (result = handler.execute(pathData)));

    it('returns a new path with the subject', async () => {
      expect(pathData.extend).toHaveBeenCalledTimes(1);
      expect(pathData.extend).toHaveBeenCalledWith({ subject }, null);
      await expect(result).resolves.toEqual(newPath);
    });
  });
});
