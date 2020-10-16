import LanguageResolver from '../../src/LanguageResolver';

describe('a LanguageResolver instance', () => {
  let resolver;
  beforeAll(() => resolver = new LanguageResolver());

  it('adds a languageFilter when called', async () => {
    const pathData = {
      extendPath: jest.fn(data => ({ ...data })),
    };
    const newPathData = resolver.resolve('en', pathData);
    expect(newPathData.languageFilter).toBe('en');
  });
});
