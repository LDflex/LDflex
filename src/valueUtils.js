import { literal } from '@rdfjs/data-model';

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
  if (typeof value === 'string')
    return literal(value);
  if (value && typeof value.termType === 'string')
    return value;
  throw new Error(`Invalid object: ${value}`);
}
