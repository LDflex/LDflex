import ThenHandler from '../../src/ThenHandler';

describe('a ThenHandler instance', () => {
  let handler;
  beforeAll(() => {
    handler = new ThenHandler();
  });

  describe('on a path with a non-thenable subject', () => {
    const subject = 'https://example.org/#Alice';
    const pathData = { subject };

    let thenable;
    beforeAll(() => {
      thenable = {
        then: handler.handle(pathData),
      };
    });

    it('results in an object that awaits to itself', async () => {
      expect(await thenable).toEqual(thenable);
    });
  });

  describe('on a path with a thenable subject', () => {
    const subject = 'https://example.org/#Alice';
    const pathData = { subject: Promise.resolve(subject) };
    const subjectPath = {};
    const path = { subject: Promise.resolve(subjectPath) };

    let thenable;
    beforeAll(() => {
      thenable = {
        then: handler.handle(pathData, path),
      };
    });

    it('resolves to the subject path', async () => {
      expect(await thenable).toEqual(subjectPath);
    });
  });

  describe('on a path with results', () => {
    const results = [
      'https://example.org/#Alice',
      'https://example.org/#Bob',
    ];
    const pathData = {};
    const path = {
      results: (async function *getResults() {
        for (const subject of results)
          yield { subject };
      }()),
    };

    let thenable;
    beforeAll(() => {
      thenable = {
        then: handler.handle(pathData, path),
      };
    });

    it('resolves to the first result', async () => {
      expect(await thenable).toEqual({ subject: results[0] });
    });
  });
});
