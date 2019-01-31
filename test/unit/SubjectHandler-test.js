import SubjectHandler from '../../src/SubjectHandler';

describe('a SubjectHandler instance', () => {
  let handler;
  const newPath = {};
  const extendPath = jest.fn(() => newPath);
  beforeAll(() => handler = new SubjectHandler());

  describe('when no subject or parent property is present', () => {
    const pathData = { extendPath };
    let result;
    beforeEach(() => (result = handler.handle(pathData)));

    it('returns undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when subject is an object', () => {
    const subject = {};
    const pathData = { subject, extendPath };
    let result;
    beforeEach(() => (result = handler.handle(pathData)));

    it('returns a new path with the subject', async () => {
      expect(pathData.extendPath).toHaveBeenCalledTimes(1);
      expect(pathData.extendPath).toHaveBeenCalledWith({ subject }, null);
      await expect(result).resolves.toEqual(newPath);
    });
  });

  describe('when subject is a promise to an object', () => {
    const subject = {};
    const pathData = { subject: Promise.resolve(subject), extendPath };
    let result;
    beforeEach(() => (result = handler.handle(pathData)));

    it('returns a new path with the resolved subject', async () => {
      expect(pathData.extendPath).toHaveBeenCalledTimes(1);
      expect(pathData.extendPath).toHaveBeenCalledWith({ subject }, null);
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
      extendPath,
    };
    let result;
    beforeEach(() => (result = handler.handle(pathData)));

    it('returns a new path with the subject', async () => {
      expect(pathData.extendPath).toHaveBeenCalledTimes(1);
      expect(pathData.extendPath).toHaveBeenCalledWith({ subject }, null);
      await expect(result).resolves.toEqual(newPath);
    });
  });
});
