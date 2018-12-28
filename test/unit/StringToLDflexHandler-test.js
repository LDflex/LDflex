import StringToLDflexHandler from '../../src/StringToLDflexHandler';

describe('a StringToLDflexHandler instance', () => {
  const baz = {};
  const bar = { baz };
  const foo = { bar };
  const root = { foo };
  global.globalVar = 'foo';

  let handler, parseLDflex;
  beforeEach(() => {
    handler = new StringToLDflexHandler();
    parseLDflex = handler.execute(null, root);
  });

  it('resolves dot-based property access without dot', () => {
    expect(parseLDflex('foo.bar.baz')).toBe(baz);
  });

  it('resolves dot-based property access with dot', () => {
    expect(parseLDflex('.foo.bar.baz')).toBe(baz);
  });

  it('resolves bracket-based property access with double quotes', () => {
    expect(parseLDflex('["foo"].bar.baz')).toBe(baz);
  });

  it('resolves bracket-based property access with single quotes', () => {
    expect(parseLDflex("['foo'].bar.baz")).toBe(baz);
  });

  it('resolves bracket-based property access with backticks', () => {
    expect(parseLDflex('[`foo`].bar.baz')).toBe(baz);
  });

  it('resolves bracket-based property access without quotes', () => {
    expect(parseLDflex('[foo].bar.baz')).toBe(baz);
  });

  it('resolves multiple bracket-based property accesses without quotes', () => {
    expect(parseLDflex('[foo][bar][baz]')).toBe(baz);
  });

  it('resolves parentheses in bracket-based property access', () => {
    expect(parseLDflex('[("foo")].bar.baz')).toBe(baz);
    expect(parseLDflex('[(globalVar)].bar.baz')).toBe(baz);
  });

  it('resolves to the root when no expression is passed', () => {
    expect(parseLDflex()).toBe(root);
  });

  it('errors on invalid expressions', () => {
    expect(() => parseLDflex('..foo.bar'))
      .toThrow('Expression "..foo.bar" is invalid: Unexpected token .');
  });
});
