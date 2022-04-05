import { langMatches } from '../../src/LanguageHandler';

// TODO: Add errors for when non BCP47 strings are passed
describe('langMatches', () => {
  const tests = [
    [['de-DE', 'de-*-DE'], true],
    [['de-de', 'de-*-DE'], true],
    [['de-Latn-DE', 'de-*-DE'], true],
    [['de-Latf-DE', 'de-*-DE'], true],
    [['de-DE-x-goethe', 'de-*-DE'], true],
    [['de-Latn-DE-1996', 'de-*-DE'], true],
    [['de', 'de-*-DE'], false],
    [['de-X-De', 'de-*-DE'], false],
    [['de-Deva', 'de-*-DE'], false],
  ];

  it('runs all the langMatches tests correctly', () => {
    for (const [[tag, range], isValid] of tests)
      expect(langMatches(tag, range)).toBe(isValid);
  });
});


