import { namedNode, literal } from '@rdfjs/data-model';

const xsd = 'http://www.w3.org/2001/XMLSchema#';
const xsdBoolean = namedNode(`${xsd}boolean`);
const xsdDateTime = namedNode(`${xsd}dateTime`);
const xsdDecimal = namedNode(`${xsd}decimal`);
const xsdInteger = namedNode(`${xsd}integer`);
const xsdDouble = namedNode(`${xsd}double`);

const xsdTrue = literal('true', xsdBoolean);
const xsdFalse = literal('false', xsdBoolean);
const xsdNaN = literal('NaN', xsdDouble);
const xsdInf = literal('INF', xsdDouble);
const xsdMinusInf = literal('-INF', xsdDouble);

// Checks whether the value is asynchronously iterable
export function isAsyncIterable(value) {
  return value && typeof value[Symbol.asyncIterator] === 'function';
}

// Checks whether the value is an object without special meaning to LDflex
export function isPlainObject(value) {
  return value !== null &&
    // Ignore non-objects
    typeof value === 'object' &&
    // Ignore arrays
    !Array.isArray(value) &&
    // Ignore Promise instances
    typeof value.then !== 'function' &&
    // Ignore RDF/JS Term instances
    typeof value.termType !== 'string' &&
    // Ignore LDflex paths
    !isAsyncIterable(value);
}

// Checks whether the arguments consist of exactly one plain object
export function hasPlainObjectArgs(args, allowMultiple = false) {
  const hasPlainObject = args.some(isPlainObject);
  if (hasPlainObject && !allowMultiple && args.length !== 1)
    throw new Error(`Expected only 1 plain object, but got ${args.length} arguments`);
  return hasPlainObject;
}

// Ensures that the value is an array
export function ensureArray(value) {
  if (Array.isArray(value))
    return value;
  return value ? [value] : [];
}

// Joins the arrays into a single array
export function joinArrays(arrays) {
  return [].concat(...arrays);
}

// Ensures the value is an RDF/JS term
export function valueToTerm(value) {
  switch (typeof value) {
  // strings
  case 'string':
    return literal(value);

  // booleans
  case 'boolean':
    return value ? xsdTrue : xsdFalse;

  // numbers
  case 'number':
    if (Number.isInteger(value))
      return literal(value.toString(), xsdInteger);
    else if (Number.isFinite(value))
      return literal(value.toString(), xsdDecimal);
    else if (value === Infinity)
      return xsdInf;
    else if (value === -Infinity)
      return xsdMinusInf;
    return xsdNaN;

  // other objects
  default:
    if (value) {
      // RDF/JS Term
      if (typeof value.termType === 'string')
        return value;
      // Date
      if (value instanceof Date)
        return literal(value.toISOString(), xsdDateTime);
    }
  }

  // invalid objects
  throw new Error(`Invalid object: ${value}`);
}
