import { fragmentHandler, namespaceHandler } from '../../src/URIHandler';
import { blankNode, namedNode } from '@rdfjs/data-model';

describe('Testing namespace handler', () => {
  it('returns the namespace of a NamedNode subject', () => {
    expect(namespaceHandler.handle({ subject: namedNode('http://example.org/subject') })).toBe('http://example.org/');
  });

  it('returns undefined on a BlankNode subject', () => {
    expect(namespaceHandler.handle({ subject: blankNode('http://example.org/subject') })).toBe(undefined);
  });

  it('Returns correct namespace for http://example.org#jesse/wright', () => {
    expect(namespaceHandler.handle({ subject: namedNode('http://example.org#jesse/wright') })).toBe('http://example.org#');
  });
});

describe('Testing fragment handler', () => {
  it('returns the namespace of a NamedNode subject', () => {
    expect(fragmentHandler.handle({ subject: namedNode('http://example.org/subject') })).toBe('subject');
  });

  it('returns undefined on a BlankNode subject', () => {
    expect(fragmentHandler.handle({ subject: blankNode('http://example.org/subject') })).toBe(undefined);
  });

  it('Returns correct namespace for http://example.org#jesse/wright', () => {
    expect(fragmentHandler.handle({ subject: namedNode('http://example.org#jesse/wright') })).toBe('jesse/wright');
  });
});

