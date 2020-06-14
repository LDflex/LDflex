import { namedNode, literal } from '@rdfjs/data-model';

const xsd = 'http://www.w3.org/2001/XMLSchema#';

const xsdBoolean = `${xsd}boolean`;
const xsdDateTime = `${xsd}dateTime`;
const xsdDecimal = `${xsd}decimal`;
const xsdDouble = `${xsd}double`;
const xsdFloat = `${xsd}float`;
const xsdInteger = `${xsd}integer`;

const xsdBooleanTerm = namedNode(xsdBoolean);
const xsdDateTimeTerm = namedNode(xsdDateTime);
const xsdDecimalTerm = namedNode(xsdDecimal);
const xsdDoubleTerm = namedNode(xsdDouble);
const xsdIntegerTerm = namedNode(xsdInteger);

const xsdTrue = literal('true', xsdBooleanTerm);
const xsdFalse = literal('false', xsdBooleanTerm);
const xsdNaN = literal('NaN', xsdDoubleTerm);
const xsdInf = literal('INF', xsdDoubleTerm);
const xsdMinusInf = literal('-INF', xsdDoubleTerm);

const xsdPrimitives = {
  NaN,
  'INF': Infinity,
  '-INF': -Infinity,
};

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
    // Ignore dates
    !(value instanceof Date) &&
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
      return literal(value.toString(), xsdIntegerTerm);
    else if (Number.isFinite(value))
      return literal(value.toString(), xsdDecimalTerm);
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
        return literal(value.toISOString(), xsdDateTimeTerm);
    }
  }

  // invalid objects
  throw new Error(`Invalid object: ${value}`);
}

// Converts the term into a primitive value
export function termToPrimitive(term) {
  const { termType, value } = term;

  // Some literals convert into specific primitive values
  if (termType === 'Literal') {
    const datatype = term.datatype.value;
    if (datatype.startsWith(xsd)) {
      switch (datatype) {
      case xsdBoolean:
        return value === 'true' || value === '1';
      case xsdInteger:
        return Number.parseInt(value, 10);
      case xsdDecimal:
        return Number.parseFloat(value);
      case xsdDouble:
      case xsdFloat:
        if (value in xsdPrimitives)
          return xsdPrimitives[value];
        return Number.parseFloat(value);
      case xsdDateTime:
        return new Date(Date.parse(value));
      default:
      }
    }
  }

  // All other nodes convert to their value
  return value;
}
