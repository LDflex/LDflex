import {
  valueToTerm,
  termToPrimitive,
} from '../../src/valueUtils';

import { namedNode, literal } from '@rdfjs/data-model';

describe('valueToTerm', () => {
  it('leaves a named node unchanged', () => {
    const term = namedNode('http://example.org/');
    expect(valueToTerm(term)).toBe(term);
  });

  it('leaves a literal unchanged', () => {
    const term = literal('abc');
    expect(valueToTerm(term)).toBe(term);
  });

  it('converts a string into a literal', () => {
    expect(valueToTerm('abc')).toEqual(literal('abc'));
  });

  it('converts true into a boolean literal', () => {
    expect(valueToTerm(true)).toEqual(
      literal('true', 'http://www.w3.org/2001/XMLSchema#boolean'));
  });

  it('converts false into a boolean literal', () => {
    expect(valueToTerm(false)).toEqual(
      literal('false', 'http://www.w3.org/2001/XMLSchema#boolean'));
  });

  it('converts an integer into an integer literal', () => {
    expect(valueToTerm(42)).toEqual(
      literal('42', 'http://www.w3.org/2001/XMLSchema#integer'));
  });

  it('converts a decimal number into a decimal literal', () => {
    expect(valueToTerm(4.2)).toEqual(
      literal('4.2', 'http://www.w3.org/2001/XMLSchema#decimal'));
  });

  it('converts NaN into a double literal', () => {
    expect(valueToTerm(NaN)).toEqual(
      literal('NaN', 'http://www.w3.org/2001/XMLSchema#double'));
  });

  it('converts Infinity into a double literal', () => {
    expect(valueToTerm(Infinity)).toEqual(
      literal('INF', 'http://www.w3.org/2001/XMLSchema#double'));
  });

  it('converts -Infinity into a double literal', () => {
    expect(valueToTerm(-Infinity)).toEqual(
      literal('-INF', 'http://www.w3.org/2001/XMLSchema#double'));
  });

  it('converts a date into a date literal', () => {
    expect(valueToTerm(new Date(Date.UTC(2020, 1, 28, 21, 0, 0)))).toEqual(
      literal('2020-02-28T21:00:00.000Z', 'http://www.w3.org/2001/XMLSchema#dateTime'));
  });

  it('does not convert null', () => {
    expect(() => valueToTerm(null))
      .toThrow(new Error('Invalid object: null'));
  });

  it('does not convert undefined', () => {
    expect(() => valueToTerm(undefined))
      .toThrow(new Error('Invalid object: undefined'));
  });

  it('does not convert unknown objects', () => {
    expect(() => valueToTerm({ toString: () => 'MyObject' }))
      .toThrow(new Error('Invalid object: MyObject'));
  });
});

describe('termToPrimitive', () => {
  it('returns the value of a named node', () => {
    expect(termToPrimitive(namedNode('http://ex.org/'))).toBe('http://ex.org/');
  });

  it('returns the value of a string literal', () => {
    expect(termToPrimitive(literal('abc'))).toBe('abc');
  });

  it('returns the value of a typed string literal', () => {
    expect(termToPrimitive(literal('abc', 'http://ex.org/'))).toBe('abc');
  });

  it('converts true into a boolean', () => {
    expect(termToPrimitive(
      literal('true', 'http://www.w3.org/2001/XMLSchema#boolean')))
      .toBe(true);
  });

  it('converts false into a boolean', () => {
    expect(termToPrimitive(
      literal('false', 'http://www.w3.org/2001/XMLSchema#boolean')))
      .toBe(false);
  });

  it('converts an integer into a number', () => {
    expect(termToPrimitive(
      literal('42', 'http://www.w3.org/2001/XMLSchema#integer')))
      .toBe(42);
  });

  it('converts a decimal into a number', () => {
    expect(termToPrimitive(
      literal('4.2', 'http://www.w3.org/2001/XMLSchema#decimal')))
      .toBe(4.2);
  });

  it('converts a float into a number', () => {
    expect(termToPrimitive(
      literal('4.2', 'http://www.w3.org/2001/XMLSchema#float')))
      .toBe(4.2);
  });

  it('converts a double into a number', () => {
    expect(termToPrimitive(
      literal('-1E4', 'http://www.w3.org/2001/XMLSchema#double')))
      .toBe(-10000);
  });

  it('converts an invalid numerical value into a number', () => {
    expect(termToPrimitive(
      literal('invalid', 'http://www.w3.org/2001/XMLSchema#double')))
      .toBe(NaN);
  });

  it('converts NaN (double) into a number', () => {
    expect(termToPrimitive(
      literal('NaN', 'http://www.w3.org/2001/XMLSchema#double')))
      .toBe(NaN);
  });

  it('converts Infinity (double) into a number', () => {
    expect(termToPrimitive(
      literal('INF', 'http://www.w3.org/2001/XMLSchema#double')))
      .toBe(Infinity);
  });

  it('converts -Infinity (double) into a number', () => {
    expect(termToPrimitive(
      literal('-INF', 'http://www.w3.org/2001/XMLSchema#double')))
      .toBe(-Infinity);
  });

  it('converts NaN (float) into a number', () => {
    expect(termToPrimitive(
      literal('NaN', 'http://www.w3.org/2001/XMLSchema#float')))
      .toBe(NaN);
  });

  it('converts Infinity (float) into a number', () => {
    expect(termToPrimitive(
      literal('INF', 'http://www.w3.org/2001/XMLSchema#float')))
      .toBe(Infinity);
  });

  it('converts -Infinity (float) into a number', () => {
    expect(termToPrimitive(
      literal('-INF', 'http://www.w3.org/2001/XMLSchema#float')))
      .toBe(-Infinity);
  });

  it('converts a date into a date', () => {
    expect(termToPrimitive(
      literal('2020-02-28T21:00:00.000Z', 'http://www.w3.org/2001/XMLSchema#dateTime')))
      .toEqual(new Date(Date.UTC(2020, 1, 28, 21, 0, 0)));
  });
});
